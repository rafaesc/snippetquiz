#!/bin/sh
set -e

echo "Starting ai-content-service..."

# Wait for database to be ready (optional but recommended)
echo "Waiting for database connection..."
until npx prisma db push --schema=prisma/ai-content-service/schema.prisma --accept-data-loss 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=prisma/ai-content-service/schema.prisma

echo "Starting application..."
# Execute the main command
exec "$@"