#!/bin/sh
set -eu

CONNECT_BASE="http://connect:8083/connectors"
CONNECTOR_NAME="core-connector"
CONNECT_URL="$CONNECT_BASE/$CONNECTOR_NAME"
CONNECTOR_CONFIG_FILE="/scripts/postgres-connector.config.json"
echo "Waiting for Kafka Connect to be available..."
until curl -sSf "$CONNECT_BASE" >/dev/null; do
  sleep 5
  echo "Still not available..."
done

CONFIG_JSON="$(cat "$CONNECTOR_CONFIG_FILE")"

EXISTS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CONNECT_URL")
if [ "$EXISTS_CODE" = "200" ]; then
  echo "Connector already exists. Updating configuration..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT -H "Content-Type: application/json" --data "$CONFIG_JSON" "$CONNECT_URL/config")
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Connector updated successfully."
  else
    echo "❌ Failed to update connector. HTTP $HTTP_CODE"
    echo "Error response: $(curl -s -X PUT -H "Content-Type: application/json" --data "$CONFIG_JSON" "$CONNECT_URL/config")"
    exit 1
  fi
else
  echo "Creating new connector..."
  CREATE_BODY="{\"name\":\"$CONNECTOR_NAME\",\"config\":$CONFIG_JSON}"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" --data "$CREATE_BODY" "$CONNECT_BASE")
  if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Connector created successfully."
  else
    echo "❌ Failed to create connector. HTTP $HTTP_CODE"
    echo "Error response: $(curl -s -X POST -H "Content-Type: application/json" --data "$CREATE_BODY" "$CONNECT_BASE")"
    exit 1
  fi
fi
