import type { AuthFlowsConfig } from '@volcanicminds/backend'

//
// How people log in to the sample (docs/AUTH_FLOW_V5.md of the framework).
//
// Two ways in on the tenant plane: a password, or a code sent to the address on file, with no
// password at all. An administrator may only use the password, because a mailbox alone is not
// enough to administer the application, and is asked for a TOTP code once enrolled; so is anyone
// else who enrolled one. `MFA_POLICY=MANDATORY` would add the second factor for everyone, without a
// line here: the engine applies the policy whatever this file says.
//
// To ask a password login for an email code as a second factor instead, list it in the stage:
// `{ anyOf: ['totp', 'email-otp'], optional: true }`. Every confirmed address counts as enrolled in
// `email-otp`, so that stage applies to every such user.
//
// This block replaces the framework's tenant block whole. The control plane is not declared, so
// it keeps the framework's: a password, then TOTP for an operator who has one.
//
const authFlows: AuthFlowsConfig = {
  tenant: {
    identify: ['password', 'email-otp'],
    flows: [
      { roles: ['admin'], identifiers: ['password'], stages: [{ anyOf: ['totp'], optional: true }] },
      { roles: ['*'], stages: [{ anyOf: ['totp'], optional: true }] }
    ]
  }
}

export default authFlows
