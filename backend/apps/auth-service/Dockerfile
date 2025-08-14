# Multi-stage Dockerfile to optimize build and production images

# Base image used across all stages
FROM node:21-alpine3.19 AS base

# -------------------------------
# Stage 1: Install dependencies
# -------------------------------
FROM base AS deps

# Set working directory
WORKDIR /usr/src/app

# Copy package manifest files
COPY package.json ./
COPY package-lock.json ./

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

# Build argument for PostgreSQL database connection URL used during Prisma operations
ARG DATABASE_URL_POSTGRES

ENV DATABASE_URL_POSTGRES=$DATABASE_URL_POSTGRES

# Generate Prisma client
RUN npx prisma generate --schema=prisma/db-postgres/schema.prisma

# Run Prisma migrations
RUN npx prisma migrate deploy --schema=prisma/db-postgres/schema.prisma

# Build TypeScript project (outputs to /dist)
RUN npm run build auth-service

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
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Change ownership to the non-root user
RUN chown -R backend:nodejs /usr/src/app
USER backend

# Set additional environment variables
ENV PORT=6000

EXPOSE 6000

# Use dumb-init as PID 1 to properly handle system signals
ENTRYPOINT ["dumb-init", "--"]


CMD [ "node", "dist/apps/auth-service/main.js" ]
