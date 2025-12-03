#!/bin/sh
set -e

echo "Starting ai-content-service..."

export POSTGRESQL_PRISMA_AI_CONTENT_SERVICE_URL="postgresql://${POSTGRESQL_USER}:${POSTGRESQL_PASSWORD}@${POSTGRESQL_HOST}:5432/${POSTGRESQL_DATABASE}?schema=ai_content_service"

echo "$POSTGRESQL_PRISMA_AI_CONTENT_SERVICE_URL"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=prisma/ai-content-service/schema.prisma
node ./dist/prisma/ai-content-service/seed.js


echo "Starting application..."
# Execute the main command
exec "$@"