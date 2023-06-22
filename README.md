# volcanic-backend-sample

## How to compile & run (prod)

```bash
yarn && yarn compile
yarn prod
```

## How to run (dev)

```bash
yarn start
```

The env variable RESET_PASSWORD_URI should have quotes "" in the local .env file and without quotes when filling the env in aws task definition.

## Postgres test

```bash
docker run -itd -e POSTGRES_USER=sample -e POSTGRES_PASSWORD=sample -p 5432:5432 --name db-sample postgres
```

## Environment sample

```ruby
NODE_ENV=development

HOST=0.0.0.0
PORT=2230

JWT_SECRET=tYVsL5f0D2+bL3uK3O2itT/r2wPmjzoqq+QAJN+or0k=
JWT_EXPIRES_IN=15d

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
SWAGGER_TITLE=Sample API Documentation
SWAGGER_DESCRIPTION=List of available APIs and schemas to use on platform Volcanic Sample
SWAGGER_VERSION=0.1.0
SWAGGER_PREFIX_URL=/documentation

START_DB=true
```
