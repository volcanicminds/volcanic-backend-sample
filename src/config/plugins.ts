'use strict'

export default [
  {
    name: 'cors',
    enable: false,
    options: {
      allowedOrigin: ['https://example.com', 'http://localhost:3000', 'http://localhost'],
      delegator: (req, callback) => {
        const corsOptions = {
          // This is NOT recommended for production as it enables reflection exploits
          origin: true
        }

        // do not include CORS headers for requests from localhost
        if (/^localhost$/m.test(req.headers.origin) || req.headers.origin == undefined) {
          corsOptions.origin = false
        }

        // callback expects two parameters: error and options
        callback(null, corsOptions)
      },
      origin: (origin, cb) => {
        // const hostname = new URL(origin).hostname
        // if (hostname === 'localhost') {
        //   //  Request from localhost will pass
        //   cb(null, true)
        //   return
        // }
        // // Generate an error on other origins, disabling access
        // cb(new Error('Not allowed'), false)
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      maxAge: 31536000,
      credentials: true,
      allowedHeaders: [
        'Accept',
        'Accept-Language',
        'Content-Language',
        'Content-Type',
        'Content-Length',
        'Authorization',
        'Origin',
        'v-total',
        'v-count',
        'v-page',
        'v-pageSize',
        'v-pageCount'
      ],
      exposedHeaders: [
        'Accept',
        'Accept-Language',
        'Content-Language',
        'Content-Type',
        'Content-Length',
        'Authorization',
        'Origin',
        'v-total',
        'v-count',
        'v-page',
        'v-pageSize',
        'v-pageCount'
      ]
    }
  },
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
