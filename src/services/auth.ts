//
// The two authentication managers the application brings (docs/AUTH_FLOW_V5.md of the framework).
//
// The data layer returns every manager that keeps data; these two do not keep any, they do
// something: compute a TOTP code, and deliver a sign-in code to a person. Both come from
// `@volcanicminds/tools`, wrapped in the contract the framework declares, and are handed to
// `startServer()` next to the layer. Without the first there is no second factor; without the
// second a flow that lists `email-otp` refuses the boot.
//
import * as mfa from '@volcanicminds/tools/mfa'
import { Mailer } from '@volcanicminds/tools/mailer'
import type { ChallengeDelivery, ChallengeDeliveryManagement, MfaManagement } from '@volcanicminds/backend'

export const mfaManager: MfaManagement & { isImplemented(): boolean } = {
  isImplemented: () => true,
  generateSetup: (appName, email) => mfa.generateSetupDetails(appName, email),
  // The matched time-step delta, not a boolean: the framework uses it to refuse a replayed code.
  verify: (token, secret) => mfa.verifyTokenDelta(token, secret)
}

/**
 * The codes delivered in development when no mail server is configured, newest last. Never in
 * production: a code in a log or in memory is a code whoever reads them can use.
 */
export const devOutbox: ChallengeDelivery[] = []

/** The message itself is the application's: the backend hands over data, not text. */
function compose(message: ChallengeDelivery) {
  const minutes = Math.max(1, Math.round((new Date(message.expiresAt).getTime() - Date.now()) / 60_000))
  const intro = message.purpose === 'identify' ? 'Use this code to sign in' : 'Use this code to confirm your sign-in'
  return {
    subject: `Your sign-in code: ${message.code}`,
    html: `<p>${intro}:</p><p style="font-size:24px;letter-spacing:4px"><strong>${message.code}</strong></p><p>It expires in ${minutes} minutes. If you did not ask for it, ignore this email.</p>`
  }
}

/**
 * A delivery on SMTP when `SMTP_HOST` is set; in development without it, an outbox in memory and
 * a log line; in production without it, none, so a flow that lists `email-otp` refuses the boot
 * instead of starting with sign-in codes nobody receives.
 */
export function challengeDeliveryManager(env: NodeJS.ProcessEnv = process.env): ChallengeDeliveryManagement | undefined {
  if (env.SMTP_HOST) {
    const mailer = new Mailer({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT || 587),
      secure: env.SMTP_SECURE === 'true',
      ...(env.SMTP_USER ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD || '' } } : {}),
      defaultFrom: env.MAIL_FROM
    })
    return {
      isImplemented: () => true,
      deliver: async (message) => {
        await mailer.send({ to: message.to, ...compose(message) })
      }
    }
  }

  if (env.NODE_ENV === 'production') {
    if (log.e) log.error('Sign-in codes: SMTP_HOST is not set, so no email code can be delivered')
    return undefined
  }

  return {
    isImplemented: () => true,
    deliver: async (message) => {
      devOutbox.push(message)
      if (log.w) log.warn(`Sign-in code for ${message.to} (development outbox, no SMTP_HOST): ${message.code}`)
    }
  }
}
