# 📌 DEV NOTES (ICT Library Office)
## 🧑‍💻 Development Mode
Run this when actively coding:

```bash
npm run dev

Run this when deploying or testing production build:
npm run build
npm start

#===================================================

To activate the .venv:
.\.venv\Scripts\Activate.ps1
then type cd ai-service to navigate to the ai-service directory, and then run:
python flask_stream.py

const { default: bcrypt } = await import('bcrypt');
const hash = await bcrypt.hash('PASSWORD HERE', 10);
console.log(hash);

#===================================================
If there is changes on:
Dockerfile
package.json
docker-compose.yml
docker compose down # to reset

run then:
docker compose up -d --build #
#===================================================
docker containers:
enter backend container:
docker exec -it ict-backend sh
docker ps # to check if every container is healthy

check files:
ls

check uploads:
ls uploads 

check node module exists:
ls node_modules

container quit
exit
#===================================================
docker builder prune -a
docker compose up --build

#===================================================
# =========================================
# DATABASE BACKUP & RESTORE GUIDE
# =========================================

# STEP 1:
# CREATE DATABASE BACKUP

.\backup-database.bat

# STEP 2:
# OPEN POSTGRES CONTAINER

docker exec -it ict-postgres psql -U postgres

# STEP 3:
# CREATE TEMPORARY TEST DATABASE
# (RUN INSIDE POSTGRES)

CREATE DATABASE ict_restore_test;

# STEP 4:
# EXIT POSTGRES

\q

# STEP 5:
# RESTORE BACKUP INTO TEST DATABASE

type database_backups\YOUR_BACKUP.sql | docker exec -i ict-postgres psql -U postgres -d ict_restore_test

# STEP 6:
# VERIFY RESTORE SUCCESS

docker exec -it ict-postgres psql -U postgres -d ict_restore_test

# STEP 7:
# SHOW ALL TABLES
# (RUN INSIDE POSTGRES)

\dt

# EXPECTED RESULT:
# Tables such as:
# - users
# - audit_logs
# - attendance
# - devices
# etc...
#
# If tables appear:
# BACKUP + RESTORE SUCCESSFUL


# OPEN POWERSHELL
code $PROFILE

SAVE CHANGES THEN
# REFRESH
profile