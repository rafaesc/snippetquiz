#!/bin/sh

# Create env-config.js with runtime environment variables
echo "window.__ENV = {" > ./public/env-config.js
echo "  API_BASE_URL: \"$API_BASE_URL\"," >> ./public/env-config.js
echo "};" >> ./public/env-config.js

# Execute the main command
exec "$@"
