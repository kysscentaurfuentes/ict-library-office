# ICT-LIBRARY-OFFICE/scripts/deploy-prod.sh

#!/bin/bash

set -e

echo "================================================="
echo "ICT LIBRARY OFFICE - PRODUCTION DEPLOYMENT"
echo "================================================="

echo ""
echo "[1/7] Pulling latest repository..."
git pull origin main

echo ""
echo "[2/7] Creating database backup..."
mkdir -p database_backups

docker exec ict-postgres-prod pg_dump -U postgres ict_library > \
database_backups/latest-backup.sql || true

echo ""
echo "[3/7] Pulling latest production images..."
docker compose \
  -f docker/production/docker-compose.prod.yml \
  pull

echo ""
echo "[4/7] Restarting production stack..."
docker compose \
  -f docker/production/docker-compose.prod.yml \
  up -d

echo ""
echo "[5/7] Restarting monitoring stack..."
docker compose \
  -f monitoring/docker-compose.monitoring.yml \
  up -d

echo ""
echo "[6/7] Cleaning unused Docker images..."
docker image prune -f

echo ""
echo "[7/7] Checking container health..."
docker ps

echo ""
echo "================================================="
echo "DEPLOYMENT FINISHED"
echo "================================================="

# =========================================================
# COST NOTES
# =========================================================
#
# FREE STAGE:
# - Local deployment
# - Docker Desktop
# - Oracle Cloud Free Tier
#
# FUTURE OPTIONAL COSTS:
#
# VPS:
# - $5-$12/month
#
# DOMAIN:
# - around $10/year
#
# SSL:
# - Let's Encrypt = FREE
#
# =========================================================