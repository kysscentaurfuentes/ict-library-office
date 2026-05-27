# ICT-LIBRARY-OFFICE/scripts/deploy-prod.sh

#!/bin/bash

echo "================================================="
echo "ICT LIBRARY OFFICE - PRODUCTION DEPLOYMENT"
echo "================================================="

set -e

echo ""
echo "[1/5] Pulling latest repository..."
git pull origin main

echo ""
echo "[2/5] Pulling latest Docker images..."
docker compose \
  -f docker/production/docker-compose.prod.yml \
  pull

echo ""
echo "[3/5] Restarting production containers..."
docker compose \
  -f docker/production/docker-compose.prod.yml \
  up -d

echo ""
echo "[4/5] Cleaning unused Docker images..."
docker image prune -f

echo ""
echo "[5/5] Deployment complete."
docker ps

echo ""
echo "================================================="
echo "ICT LIBRARY OFFICE DEPLOYED SUCCESSFULLY"
echo "================================================="