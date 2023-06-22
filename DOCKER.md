# Docker

try to use these to run the app in a docker node:16-alpine image:

```js

// easy
docker build -t volcanic-backend-sample .
docker run -dp 2230:2230 -it volcanic-backend-sample

// prod
docker build -f Dockerfile.prod -t volcanic-backend-sample-prod .
docker run -dp 2230:2230 -it volcanic-backend-sample-prod

// detached mode with autoremove when stopped
docker run --rm -dp 2230:2230 -it volcanic-backend-sample

// attached mode with autoremove when stopped
docker run --rm -p 2230:2230 -it volcanic-backend-sample

// remove
docker image rm volcanic-backend-sample

// prune all
docker system prune --all

```
