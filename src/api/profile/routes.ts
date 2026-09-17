//
// The caller's own profile (T-10.23): names and language, in this project's `user_profile`.
//
// The service existed and nothing called it, so the pattern the sample exists to show (the
// application's facts about a user in a table of its own, not columns bolted onto the
// framework's `user`) was documented and unreachable. Two routes make it real: read your
// profile, write your profile. Only your own: the user id comes from the token.
//
export default {
  config: {
    title: 'Profile functions',
    description: "The caller's own profile",
    controller: 'controller',
    enable: true,
    tags: ['Profile']
  },
  routes: [
    {
      method: 'GET',
      path: '/',
      roles: [],
      handler: 'profile.read',
      middlewares: ['global.isAuthenticated'],
      config: {
        title: 'Read my profile',
        description: 'The profile of the authenticated user, or its defaults when none was written yet',
        response: { 200: { $ref: 'profileSchema#' } }
      }
    },
    {
      method: 'PUT',
      path: '/',
      roles: [],
      handler: 'profile.write',
      middlewares: ['global.isAuthenticated'],
      config: {
        title: 'Write my profile',
        description: 'Creates or updates the profile of the authenticated user',
        body: { $ref: 'profileBodySchema#' },
        response: { 200: { $ref: 'profileSchema#' } }
      }
    }
  ]
}
