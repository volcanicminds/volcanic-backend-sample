# volcanic-backend-sample

## How to compile & run (prod)

```bash
npm run build
```

## How to run (dev)

```bash
npm run dev # or npm run start
```

## Environment sample

```ruby
NODE_ENV=development

HOST=0.0.0.0
PORT=2230

JWT_SECRET=<choose a fantastic secret>
JWT_EXPIRES_IN=1d

JWT_REFRESH=true
JWT_REFRESH_SECRET=<choose another fantastic secret>
JWT_REFRESH_EXPIRES_IN=10d

# LOG_LEVEL: trace, debug, info, warn, error, fatal
LOG_LEVEL=trace
LOG_COLORIZE=true
LOG_TIMESTAMP=true
LOG_TIMESTAMP_READABLE=true
LOG_FASTIFY=false
LOG_DB_LEVEL=warn

GRAPHQL=false
SWAGGER=true
# SWAGGER_HOST=localhost:2230
SWAGGER_TITLE=Volcanic Backend Sample API Documentation
SWAGGER_DESCRIPTION=List of available APIs and schemas to use
SWAGGER_VERSION=0.1.0
SWAGGER_PREFIX_URL=/api-docs

START_DB=false
```

More info on [Volcanic Backend - GitHub](https://github.com/volcanicminds/volcanic-backend)
