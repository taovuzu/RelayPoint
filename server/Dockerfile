FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

ENV NODE_ENV=production
EXPOSE 8080

# Add tini for proper signal handling and curl for healthchecks
RUN apk add --no-cache tini curl

ENTRYPOINT ["/sbin/tini", "-g", "--"]
CMD ["node", "src/index.js"]


