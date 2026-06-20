# ICT-LIBRARY-OFFICE/DEV-NOTES.md
# 📌 DEV NOTES (ICT Library Office)

# ===================================================
# TABLE OF CONTENTS
# ===================================================

[LINE 018] GITHUB WORKFLOW
[LINE 096] DEVELOPMENT
[LINE 163] DOCKER OPERATIONS
[LINE 247] DOCKER TROUBLESHOOTING
[LINE 358] PROJECT URLS
[LINE 386] DATABASE BACKUP & RESTORE
[LINE 446] POWERSHELL PROFILE
[LINE 463] POWERSHELL CLIPBOARD
[LINE 500] END OF DEV NOTES

# ===================================================
# GITHUB WORKFLOW
# ===================================================

## Check Current Changes

```bash
git status
```

## Stage All Changes

```bash
git add .
```

## Undo Staged Changes

```bash
git restore --staged .
```

## Create Commit

```bash
git commit -m "Your commit message"
```

## Push to GitHub

```bash
git push origin main
```

## If Git Becomes Slow

Check staged files:

```bash
git status
```

```bash
git diff --cached --stat
```

Remove staged files:

```bash
git restore --staged .
```

Update `.gitignore` if needed, then:

```bash
git add .
```

## Commit History

```bash
git log --oneline
```

## Undo Last Commit (Keep Files)

```bash
git reset --soft HEAD~1
```

## Undo Last Commit (Discard Completely)

WARNING: Use carefully.

```bash
git reset --hard HEAD~1
```

# ===================================================
# DEVELOPMENT
# ===================================================

## Frontend

```powershell
cd frontend
npm run dev
```

Production:

```powershell
npm run build
npm start
```

## AI Service

Activate virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

Start AI Service:

```powershell
cd ai-service
python flask_stream.py
```

## Manual Development Startup

### Terminal 1 - MediaMTX

```powershell
cd D:\mediamtx
.\mediamtx.exe
```

### Terminal 2 - Backend

```powershell
cd D:\ICT-Library-Office\backend
npm run dev
```

### Terminal 3 - Frontend

```powershell
cd D:\ICT-Library-Office\frontend
npm run dev
```

### Terminal 4 - AI Service

```powershell
cd D:\ICT-Library-Office

.\.venv\Scripts\Activate.ps1

cd ai-service
python flask_stream.py
```

# ===================================================
# DOCKER OPERATIONS
# ===================================================

## Start Docker Service

Run PowerShell as Administrator:

```powershell
Start-Service com.docker.service
```

## Start Project
Start containers:

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml up -d

docker compose --env-file monitoring/.env.monitoring -f monitoring/docker-compose.monitoring.yml up -d
```

Build containers:

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml up -d --build

docker compose --env-file monitoring/.env.monitoring -f monitoring/docker-compose.monitoring.yml up -d --build
```

## Rebuild Containers

Use when Dockerfiles, dependencies, or compose files change:

```powershell
n 0
```

## Check Container Status

```powershell
docker ps
```

Expected:

- postgres = healthy
- redis = healthy
- ai-service = healthy
- backend = healthy
- frontend = healthy

## Stop Project

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml down
```

## Stop Docker Completely

Run PowerShell as Administrator:

```powershell
Stop-Service com.docker.service

taskkill /F /IM "Docker Desktop.exe"
```

Optional:

```powershell
wsl --shutdown
```

## Start Again After Shutdown

Run PowerShell as Administrator:

```powershell
Start-Service com.docker.service
```

Verify:

```powershell
docker ps
```

# ===================================================
# DOCKER TROUBLESHOOTING
# ===================================================
## Container Name Conflict
Especially if Ctrl+C Stopped While building in the middle
Error:

```text
Conflict. The container name "/ict-backend-dev" is already in use
```

# Check all containers
docker ps -a

# Remove stuck containers (usually STATUS = Created)
docker rm -f (Ex.) ict-backend-dev ict-postgres-dev ict-redis-dev ict-ai-service-dev ict-mediamtx-dev


# Start project again
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml up -d --build


## Docker Engine Stuck Loading

```powershell
wsl --shutdown

Stop-Service com.docker.service

Start-Service com.docker.service
```

Verify:

```powershell
docker ps
```

## 502 Bad Gateway

Check containers:

```powershell
docker ps
```

Wait until:

- frontend = healthy
- backend = healthy
- postgres = healthy

Restart nginx:

```powershell
docker restart ict-nginx-dev
```

Hard refresh browser:

```text
Ctrl + Shift + R
```

## Docker File Changes

If changes were made to:

- Dockerfile
- package.json
- requirements.txt
- docker-compose.yml

Run:

```powershell
docker compose down
```

Then:

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml up -d --build
```

## Container Access

Open backend container:

```powershell
docker exec -it ict-backend-dev sh
```

Check files:

```bash
ls
```

Check uploads:

```bash
ls uploads
```

Check node modules:

```bash
ls node_modules
```

Exit:

```bash
exit
```

## Docker Cleanup

```powershell
docker builder prune -a
```

Rebuild:

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml up -d --build
```

# ===================================================
# PROJECT URLS
# ===================================================

Frontend

```text
http://localhost
```

Backend

```text
http://localhost:4000
```

AI Service

```text
http://localhost:5000
```

HLS Stream

```text
http://localhost:4000/hls/stream.m3u8
```

# ===================================================
# DATABASE BACKUP & RESTORE
# ===================================================

## Create Backup

```powershell
.\backup-database.bat
```

## Open PostgreSQL

```powershell
docker exec -it ict-postgres-dev psql -U postgres
```

## Create Test Database

Inside PostgreSQL:

```sql
CREATE DATABASE ict_restore_test;
```

## Exit PostgreSQL

```sql
\q
```

## Restore Backup

```powershell
type database_backups\YOUR_BACKUP.sql | docker exec -i ict-postgres-dev psql -U postgres -d ict_restore_test
```

## Verify Restore

```powershell
docker exec -it ict-postgres-dev psql -U postgres -d ict_restore_test
```

## Show Tables

```sql
\dt
```

Expected:

- users
- audit_logs
- attendance
- devices
- etc.

If tables appear:

BACKUP + RESTORE SUCCESSFUL

# ===================================================
# POWERSHELL PROFILE
# ===================================================

Open profile:

```powershell
code $PROFILE
```

Reload profile:

```powershell
. $PROFILE
```

# ===================================================
# POWERSHELL CLIPBOARD
# ===================================================

```powershell
# Show clipboard
Get-Clipboard

# Copy output only
COMMAND 2>&1 | clip
COMMAND 2>&1 | Set-Clipboard

# Copy command + output (silent)
("[COMMAND]`nCOMMAND_HERE`n`n[OUTPUT]`n" + (COMMAND_HERE 2>&1 | Out-String)) | Set-Clipboard

# Print to terminal + copy command + output (recommended)
COMMAND_HERE 2>&1 | Tee-Object -Variable out
("[COMMAND]`nCOMMAND_HERE`n`n[OUTPUT]`n" + ($out | Out-String)) | Set-Clipboard

# Examples

# Silent
("[COMMAND]`ndocker ps -a`n`n[OUTPUT]`n" + (docker ps -a | Out-String)) | Set-Clipboard

# Print + Copy
docker ps -a | Tee-Object -Variable out
("[COMMAND]`ndocker ps -a`n`n[OUTPUT]`n" + ($out | Out-String)) | Set-Clipboard

# Print + Copy AI logs
docker logs ict-ai-service-dev --tail 50 2>&1 | Tee-Object -Variable out
("[COMMAND]`ndocker logs ict-ai-service-dev --tail 50`n`n[OUTPUT]`n" + ($out | Out-String)) | Set-Clipboard

# Paste
Ctrl + V
```
# NO NEED HIGHLIGHT, CLICK AND DRAG, CTRL+C HERE ...

# ===================================================
# END OF DEV NOTES
# ===================================================