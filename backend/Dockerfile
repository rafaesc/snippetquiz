LABEL org.opencontainers.image.source https://github.com/rafaesc/quizmaster

# Multi-stage Dockerfile to optimize build and production images

# Base image used across all stages
FROM node:20-alpine AS base

# -------------------------------
# Stage 1: Install dependencies
# -------------------------------
FROM base AS deps

# Set working directory
WORKDIR /app

# Copy package manifest files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies, needed for build)
RUN npm ci

# -------------------------------
# Stage 2: Build application
# -------------------------------
FROM base AS builder

# Set working directory
WORKDIR /app

# Copy installed dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full application source code and config
COPY . .

# Build TypeScript project (outputs to /dist)
RUN npm run build

# -------------------------------
# Stage 3: Production runtime image
# -------------------------------
FROM base AS distro

# Set production environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install dumb-init to handle container signals properly (e.g., SIGTERM)
RUN apk add --no-cache dumb-init

# Create non-root user and group for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Copy compiled application from build stage
COPY --from=builder /app/dist ./dist

# Copy package manifest files for installing production dependencies
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Change ownership to the non-root user
RUN chown -R backend:nodejs /app
USER backend

# Set additional environment variables
ENV PORT=3001

# Expose application port
EXPOSE 3001

# Define health check to monitor the container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init as PID 1 to properly handle system signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]

