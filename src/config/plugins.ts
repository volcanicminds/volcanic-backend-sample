'use strict'

//
// Fastify plugins. Every entry here **replaces** the framework's entry of the same name,
// whole: the loader reads the framework's file first and this one after, keyed by plugin name.
//
// So the way to keep a framework default is to not write the block at all. `cors` is not
// listed on purpose: the default reads the allowlist from `CORS_ORIGINS` and grants
// credentials only against a real allowlist, which is the right answer for almost every
// project. v4's default — `origin: '*'` with `credentials: true` — was not a lax setting but
// a broken one: browsers refuse to honour credentials against a wildcard, so cookie mode
// never worked cross-origin, and in bearer mode the API was callable from any page
// (defect D-16). Writing a `cors` block here would replace that default and take the boot
// check's protection with it.
//
export default [
  {
    name: 'rateLimit',
    enable: false,
    options: {}
  },
  {
    name: 'helmet',
    enable: false,
    options: {}
  },
  {
    name: 'compress',
    enable: false,
    options: {}
  },
  {
    name: 'multipart',
    enable: true,
    options: {
      limits: {
        fieldNameSize: 100, // Max field name size in bytes
        fieldSize: 100, // Max field value size in bytes
        fields: 10, // Max number of non-file fields
        fileSize: 1000000, // For multipart forms, the max file size in bytes
        files: 1, // Max number of file fields
        headerPairs: 2000, // Max number of header key=>value pairs
        parts: 1000 // For multipart forms, the max number of parts (fields + files)
      }
    }
  },
  {
    name: 'rawBody',
    enable: true,
    options: {
      global: false,
      runFirst: true
    }
  }
]
