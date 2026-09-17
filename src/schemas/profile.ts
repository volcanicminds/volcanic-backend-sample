import { USER_LANGUAGES } from '../tables/enums.js'

// The caller's own profile (T-10.23). What the framework's `user` no longer carries: names and
// language live in this project's `user_profile` table, keyed by `user.id`.
export const profileBodySchema = {
  $id: 'profileBodySchema',
  type: 'object',
  // Only these three. `userId` is taken from the token, never from the body: a profile that
  // could be written for any id would be a way to write someone else's.
  additionalProperties: false,
  properties: {
    firstName: { type: 'string', nullable: true },
    lastName: { type: 'string', nullable: true },
    language: { type: 'string', enum: [...USER_LANGUAGES] }
  }
}

export const profileSchema = {
  $id: 'profileSchema',
  type: 'object',
  properties: {
    userId: { type: 'string' },
    firstName: { type: 'string', nullable: true },
    lastName: { type: 'string', nullable: true },
    language: { type: 'string' }
  }
}
