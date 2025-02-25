FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --production

# Installer dockerize (exemple pour alpine)
RUN apk add --no-cache wget && \
    wget -q https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "dockerize -wait tcp://neo4j:7474 -timeout 60s && node migrate.js && node server.js"]
