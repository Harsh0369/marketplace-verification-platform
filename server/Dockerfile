FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Tini for proper SIGTERM handling on scaling down/restarts
RUN apk add --no-cache tini

# Install ALL dependencies (including devDependencies like tsx)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

EXPOSE 3000

# Use Tini as the entrypoint to handle OS signals, and restrict V8 memory
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "tsx", "src/server.ts"]
