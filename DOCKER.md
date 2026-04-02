# Docker

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

# easy
docker build -t volcanic-backend-sample .
docker run -dp 2230:2230 -it volcanic-backend-sample

# prod
docker build -f Dockerfile.prod -t volcanic-backend-sample-prod .
docker run -dp 2230:2230 -it volcanic-backend-sample-prod

# detached mode with autoremove when stopped
docker run --rm -dp 2230:2230 -it volcanic-backend-sample

# attached mode with autoremove when stopped
docker run --rm -p 2230:2230 -it volcanic-backend-sample

# remove
docker image rm volcanic-backend-sample

# prune all
docker system prune --all

# developer
docker build --network=host -f Dockerfile.dev -t volcanic-backend-sample:dev .

```
