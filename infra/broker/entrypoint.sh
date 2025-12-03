#!/bin/bash
set -e

echo "🚀 Starting Kafka..."

# Wait until broker is ready
echo "⏳ Waiting for Kafka to become ready..."
until /opt/kafka/bin/kafka-topics.sh \
    --bootstrap-server broker:29092 --list > /dev/null 2>&1; do
    sleep 2
done

echo "✔ Kafka is ready"

############################################
# 🔧 Automatically create required topics
############################################

TOPICS=(
  "content-entry.events"
  "quiz.aggregate"
  "auth.user.verified"
)

for topic in "${TOPICS[@]}"; do
  echo "📌 Checking topic: $topic"

  if /opt/kafka/bin/kafka-topics.sh \
      --bootstrap-server broker:29092 --list | grep -q "^$topic$"; then
    echo "   ✔ Topic already exists"
  else
    echo "   ➕ Creating topic: $topic"
    /opt/kafka/bin/kafka-topics.sh \
      --create \
      --topic "$topic" \
      --bootstrap-server broker:29092 \
      --replication-factor 1 \
      --partitions 1
    echo "   Described topic: $topic"
    /opt/kafka/bin/kafka-topics.sh \
      --describe  \
      --topic "$topic" \
      --bootstrap-server broker:29092
  fi
done

echo "🎉 All topics created"

# Keep Kafka running
wait -n
