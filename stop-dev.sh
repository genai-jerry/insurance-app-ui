#!/bin/bash

# Insurance App - Stop Development Environment
# Stops all app containers (backend, frontend, postgres) but leaves Docker daemon running

echo "Stopping Insurance App Development Environment..."

if docker info > /dev/null 2>&1; then
    echo "Stopping all containers..."
    docker-compose down -v 2>/dev/null || true

    # Also remove any orphaned insurance-postgres container not managed by compose
    if docker ps -a --format '{{.Names}}' | grep -q '^insurance-postgres$'; then
        echo "Removing orphaned insurance-postgres container..."
        docker stop insurance-postgres 2>/dev/null || true
        docker rm insurance-postgres 2>/dev/null || true
    fi

    echo "All containers stopped. Docker daemon is still running."
else
    echo "Docker is not running, skipping container shutdown."
fi

# Kill any local Vite dev server on port 3000/3001
for port in 3000 3001; do
    pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo "Stopping process on port $port (PID: $pids)..."
        echo "$pids" | xargs kill 2>/dev/null
    fi
done

echo "All services stopped. Docker daemon is still running."
