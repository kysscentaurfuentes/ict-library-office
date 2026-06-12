# 📌 DEV NOTES (ICT Library Office)

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

## Undo Staged Changes (Before Commit)
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

Check what is staged:

```bash
git status
```

View staged file summary:

```bash
git diff --cached --stat
```

If large files were staged accidentally:

```bash
git restore --staged .
```

Then update `.gitignore` and run:

```bash
git add .
```

again.

## Check Commit History

```bash
git log --oneline
```

## Undo Last Commit (Keep Files)

```bash
git reset --soft HEAD~1
```

## Undo Last Commit (Discard Commit Completely)

WARNING: Use carefully.

```bash
git reset --hard HEAD~1
```
# ===================================================
# FRONTEND DEVELOPMENT
# ===================================================

## Development Mode

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

# ===================================================
# AI SERVICE (LOCAL)
# ===================================================

## Activate Virtual Environment

```powershell
.\.venv\Scripts\Activate.ps1
```

## Start AI Service

```powershell
cd ai-service
python flask_stream.py
```

# ===================================================
# MANUAL DEVELOPMENT STARTUP
# ===================================================

## Terminal 1 - MediaMTX

```powershell
cd D:\mediamtx
.\mediamtx.exe
```

## Terminal 2 - Backend

```powershell
cd D:\ICT-Library-Office\backend
npm run dev
```

## Terminal 3 - Frontend

```powershell
cd D:\ICT-Library-Office\frontend
npm run dev
```

## Terminal 4 - AI Service

```powershell
cd D:\ICT-Library-Office

.\.venv\Scripts\Activate.ps1

cd ai-service
python flask_stream.py
```

# ===================================================
# DOCKER QUICK START
# ===================================================

## Start Docker Service
Run PowerShell as Administrator:

```powershell
Start-Service com.docker.service
```

## Start Project

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml build -d
```

## Rebuild Containers
Use if Dockerfiles, dependencies, or compose files changed:

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml up -d --build
```

# ===================================================
# CHECK CONTAINER STATUS
# ===================================================

```powershell
docker ps
```

Expected:

- postgres = healthy
- redis = healthy
- ai-service = healthy
- backend = healthy
- frontend = healthy

# ===================================================
# STOP PROJECT
# ===================================================

```powershell
docker compose --env-file docker/development/.env.dev -f docker/development/docker-compose.dev.yml down
```

# ===================================================
# STOP DOCKER COMPLETELY
# ===================================================

Run PowerShell as Administrator:

```powershell
Stop-Service com.docker.service
taskkill /F /IM "Docker Desktop.exe"
```

Optional:

```powershell
wsl --shutdown
```

# ===================================================
# IF CODING AGAIN
# ===================================================

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

Check container status:

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

Then hard refresh browser:

```text
Ctrl + Shift + R
```

## Docker File Changes

If there are changes to:

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

# ===================================================
# CONTAINER ACCESS
# ===================================================

## Open Backend Container

```powershell
docker exec -it ict-backend-dev sh
```

## Check Files

```bash
ls
```

## Check Uploads

```bash
ls uploads
```

## Check Node Modules

```bash
ls node_modules
```

## Exit Container

```bash
exit
```

# ===================================================
# DOCKER CLEANUP
# ===================================================

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

Frontend:

```text
http://localhost
```

Backend:

```text
http://localhost:4000
```

AI Service:

```text
http://localhost:5000
```

HLS Stream:

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

## Open PostgreSQL Container

```powershell
docker exec -it ict-postgres-dev psql -U postgres
```

## Create Test Database

Run inside PostgreSQL:

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

Run inside PostgreSQL:

```sql
\dt
```

Expected tables:

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

Open Profile:

```powershell
code $PROFILE
```

After saving changes:

```powershell
. $PROFILE
```

# ===================================================
# END OF DEV NOTES
# ===================================================