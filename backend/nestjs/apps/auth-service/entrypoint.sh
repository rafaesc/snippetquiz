#!/bin/sh
echo "Starting auth-service..."

export POSTGRESQL_PRISMA_AUTH_URL="postgresql://${POSTGRESQL_USER}:${POSTGRESQL_PASSWORD}@${POSTGRESQL_HOST}:5432/${POSTGRESQL_DATABASE}?schema=auth"

echo "$POSTGRESQL_PRISMA_AUTH_URL"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=prisma/auth-service/schema.prisma


echo "Starting application..."
# Execute the main command
exec "$@"