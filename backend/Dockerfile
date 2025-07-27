# Use Node.js LTS version as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build || (\
    echo "TypeScript build failed. Creating dist directory and compiling manually." && \
    mkdir -p dist && \
    npx tsc --project tsconfig.json\
)

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]