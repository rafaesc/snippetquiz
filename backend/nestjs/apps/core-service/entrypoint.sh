#!/bin/sh
set -e

echo "Starting core-service..."

# Wait for database to be ready (optional but recommended)
echo "Waiting for database connection..."
until npx prisma db push --schema=prisma/db-postgres/schema.prisma --accept-data-loss 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate --schema=prisma/db-postgres/schema.prisma

echo "Starting application..."
# Execute the main command
exec "$@"