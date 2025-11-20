# Multi-stage Dockerfile to optimize build and production images

# Base image used across all stages
FROM node:20-alpine3.21 AS base

# -------------------------------
# Stage 1: Install dependencies
# -------------------------------
FROM base AS deps

# Set working directory
WORKDIR /usr/src/app

# Copy package manifest files
COPY package.json .
COPY package-lock.json .

# Install all dependencies (including devDependencies, needed for build)
RUN npm ci

# -------------------------------
# Stage 2: Build application
# -------------------------------
FROM base AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy installed dependencies from previous stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy full application source code and config
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=prisma/db-postgres/schema.prisma

# Build TypeScript project (outputs to /dist)
RUN npm run build

# -------------------------------
# Stage 3: Production runtime image
# -------------------------------
FROM base AS distro

# Set production environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Install dumb-init to handle container signals properly (e.g., SIGTERM)
RUN apk add --no-cache dumb-init

# Create non-root user and group for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Copy compiled application from build stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy package manifest files for installing production dependencies
WORKDIR /usr/src/app

COPY /package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Change ownership to the non-root user
RUN chown -R backend:nodejs /usr/src/app
USER backend

# Set additional environment variables
ENV PORT=5000

EXPOSE 5000

# Define health check to monitor the container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"


# Use dumb-init as PID 1 to properly handle system signals
ENTRYPOINT ["dumb-init", "--"]


CMD [ "node", "dist/apps/api-gateway/main.js" ]