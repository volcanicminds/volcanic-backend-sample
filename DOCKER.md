# Docker

> Images based on **node:24-bookworm-slim** (Node ≥ 24). glibc is preferred over musl because `bcrypt`
> runs on the libuv threadpool, where the musl allocator causes contention under load; bookworm ships
> native prebuilts and gives more predictable runtime performance. The sample uses the data layer of
> `@volcanicminds/backend` (`typeorm`, `pg`, `bcrypt`, ...): a reachable Postgres is required to run it.

## PostgreSQL

Use the following commands to pull and run a PostgreSQL 18 container:

```zsh

docker pull postgres:18

# without data mount
docker run -itd -e POSTGRES_USER=volcanic-backend-sample -e POSTGRES_PASSWORD=volcanic-backend-sample -p 5432:5432 --name volcanic-sample-database postgres:18

# with data mount
docker run -itd \
  --name volcanic-sample-database \
  -e POSTGRES_USER=volcanic-backend-sample \
  -e POSTGRES_PASSWORD=volcanic-backend-sample \
  -p 5432:5432 \
  -v ${PWD}/data:/var/lib/postgresql \
  postgres:18

```

## pgAdmin (PostgreSQL GUI Client)

Use the following commands to pull and run a pgAdmin4 container:

```zsh

docker pull dpage/pgadmin4:latest

docker run --name volcanic-pgadmin -p 5051:80 -e "PGADMIN_DEFAULT_EMAIL=developers@volcanicminds.com" -e "PGADMIN_DEFAULT_PASSWORD=vminds" -d dpage/pgadmin4

# pgAdmin4: connect pgsql using correct IP read from inspect (retrieve your ID by docker ps)
docker ps -aqf "name=volcanic-sample-database" # retrieve popstgres container id
docker inspect vm1234567890 | grep IPAddress

# .. or use this all in one command to grab the correct IP Address
docker inspect $(docker ps -aqf "name=volcanic-sample-database") | grep -E '^\s+"IPAddress":' | awk -F'"' '{print $4}' | head -1

# Only a hint (retrieve all IPAddress)
docker ps -q | xargs -n 1 docker inspect --format '{{ .NetworkSettings.IPAddress }} {{ .Name }}'

```

To access pgAdmin4, open your browser and go to `http://127.0.0.1:5051`.

Log in using the email and password you specified in the environment variables. Then, you can add a new server connection using the IP address of the PostgreSQL container, along with the username and password you set.

## Build and Run

```zsh

# dev (hot-reload via tsx watch; mounts the source as a volume)
docker build -f Dockerfile -t volcanic-backend-sample:dev .
docker run --rm -p 2230:2230 \
  -v ${PWD}:/usr/src/app -v /usr/src/app/node_modules \
  --env-file .env -it volcanic-backend-sample:dev

# prod (multi-stage: tsc build + slim runtime)
docker build -f Dockerfile.prod -t volcanic-backend-sample-prod .
docker run -dp 2230:2230 --env-file .env -it volcanic-backend-sample-prod

# detached with autoremove on stop
docker run --rm -dp 2230:2230 --env-file .env -it volcanic-backend-sample-prod

# remove
docker image rm volcanic-backend-sample-prod

# prune everything
docker system prune --all

```

> **Network:** to let the sample reach Postgres, use a shared docker network
> (`docker network create vminds` and `--network vminds` on both containers) with
> `DB_HOST=volcanic-sample-database`. Alternatively `host.docker.internal` on Docker Desktop.
