# ICT LIBRARY OFFICE - DOCKER DEV NOTES

# =========================================================
# DEVELOPMENT MODE
# =========================================================

## Start Development Stack
docker compose --env-file .env.dev -f docker/development/docker-compose.dev.yml up --build

## Stop Development Stack
docker compose -f docker/development/docker-compose.dev.yml down

## Rebuild Development Stack
docker compose --env-file .env.dev -f docker/development/docker-compose.dev.yml up --build

## View Development Logs
docker compose -f docker/development/docker-compose.dev.yml logs

## View Specific Container Logs
docker logs ict-backend-dev
docker logs ict-frontend-dev
docker logs ict-ai-service-dev

# =========================================================
# PRODUCTION MODE
# =========================================================

## Start Production Stack
docker compose --env-file .env.prod -f docker/production/docker-compose.prod.yml up --build

## Stop Production Stack
docker compose -f docker/production/docker-compose.prod.yml down

## View Production Logs
docker compose -f docker/production/docker-compose.prod.yml logs

# =========================================================
# MONITORING STACK
# =========================================================

## Start Monitoring Stack
cd monitoring
docker compose up -d

## Stop Monitoring Stack
docker compose down

## Grafana
http://localhost:3000

## Prometheus
http://localhost:9090

## Loki
http://localhost:3100

# =========================================================
# DATABASE COMMANDS
# =========================================================

## Open PostgreSQL Shell
docker exec -it ict-postgres-dev psql -U postgres

## Show Databases
\l

## Connect Database
\c ict_library_db

## Show Tables
\dt

# =========================================================
# DATABASE BACKUP
# =========================================================

## Backup Database
.\backup-database.bat

## Restore Test Database
docker exec -it ict-postgres-dev psql -U postgres

CREATE DATABASE ict_restore_test;

\q

type database_backups\YOUR_BACKUP.sql | docker exec -i ict-postgres-dev psql -U postgres -d ict_restore_test

# =========================================================
# CLEANUP COMMANDS
# =========================================================

## Remove Stopped Containers
docker container prune

## Remove Unused Images
docker image prune -a

## Remove Unused Volumes
docker volume prune

# =========================================================
# HEALTH CHECKS
# =========================================================

## Backend Health
http://localhost:4000/health

## AI Service Health
http://localhost:5000/health

# =========================================================
# IMPORTANT NOTES
# =========================================================

docker ps     # to check if every container is healthy
docker images
docker volume ls
docker network ls
docker logs ict-backend-dev

- DEV uses Dockerfile.dev
- PROD uses Dockerfile.prod
- DEV supports hot reload
- PROD uses optimized TypeScript build
- Monitoring stack is separated from app stack
- Use .env.dev for development
- Use .env.prod for production