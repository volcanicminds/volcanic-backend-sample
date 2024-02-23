'use strict'

module.exports = [
  {
    name: 'cors',
    enable: true,
    options: {
      origin: '*',
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
  }
]
