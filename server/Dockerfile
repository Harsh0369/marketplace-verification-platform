# ---- Build Stage (Native Speed) ----
ARG BUILDPLATFORM=linux/amd64
FROM --platform=$BUILDPLATFORM node:22-alpine AS builder
WORKDIR /app

# Install ALL dependencies to compile TS
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile TypeScript natively
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Tini for proper SIGTERM handling on scaling down/restarts
RUN apk add --no-cache tini

# Install ONLY production dependencies (Much faster and lighter)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts from native build stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Use Tini as the entrypoint to handle OS signals, and restrict V8 memory
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--max-old-space-size=512", "dist/server.js"]
