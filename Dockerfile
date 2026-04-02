# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Installiamo i tool di compilazione
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --prefer-offline --no-audit
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 2: Production Runner
FROM node:24-alpine

WORKDIR /usr/src/app

# Copiamo node_modules e dist come prima
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

# Copiamo la cartella "src" compilata dalla build alla root del container.
COPY --from=builder /usr/src/app/dist/src ./src

EXPOSE 2230

CMD [ "node", "dist/index.js" ]