#!/bin/sh
echo "Starting auth-service..."

<<<<<<< HEAD
export POSTGRESQL_PRISMA_AUTH_URL="postgresql://${POSTGRESQL_USER}:${POSTGRESQL_PASSWORD}@${POSTGRESQL_HOST}:5432/${POSTGRESQL_DATABASE}?schema=auth"
=======
# Wait for database to be ready (optional but recommended)
echo "Waiting for database connection..."
until npx prisma db push --schema=prisma/auth-service/schema.prisma --accept-data-loss 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
>>>>>>> 363c56c (feat: core service and ai processor event driven)

echo "$POSTGRESQL_PRISMA_AUTH_URL"

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=prisma/auth-service/schema.prisma
<<<<<<< HEAD

=======
>>>>>>> 363c56c (feat: core service and ai processor event driven)

echo "Starting application..."
# Execute the main command
exec "$@"