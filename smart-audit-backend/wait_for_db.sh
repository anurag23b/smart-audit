#!/bin/bash

set -e

host="$1"
port="$2"
shift 2
cmd="$@"

# Use 'anurag' user from docker-compose.yml, not 'postgres'
until pg_isready -h "$host" -p "$port" -U "anurag"; do
  echo "⏳ Waiting for database at $host:$port (user: anurag)..."
  sleep 2
done

echo "✅ Database is ready. Starting application..."
exec $cmd