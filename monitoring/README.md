# ICT-LIBRARY-OFFICE/monitoring/README.md

# =========================================================
# 🚀 ICT Library Office Monitoring Stack
# =========================================================

This monitoring stack includes:

* Prometheus
* Grafana
* Loki
* Promtail
* Node Exporter
* cAdvisor

Used for:

* system monitoring
* Docker container monitoring
* backend metrics
* log aggregation
* alerting
* dashboard visualization
* brute force detection alerts
* Docker metrics monitoring
* backend security log monitoring

---

# =========================================================
# 📁 IMPORTANT PROJECT STRUCTURE
# =========================================================

Monitoring configuration files:

```txt
ICT-LIBRARY-OFFICE/
└── monitoring/
    ├── docker-compose.monitoring.yml
    ├── .env.monitoring
    ├── grafana.ini
    ├── prometheus.yml
    ├── loki-config.yml
    ├── promtail-config.yml
    ├── grafana/
    └── grafana-data/
```

---

# =========================================================
# 🚀 START MONITORING STACK
# =========================================================

IMPORTANT:

Always run Docker Compose INSIDE the monitoring folder.

Reason:

Running compose from the wrong directory can break:

* environment variable loading
* SMTP configuration
* Grafana authentication
* Docker paths
* monitoring startup

---
## ✅ CORRECT WAY
```bash
cd monitoring
```

```bash
docker compose --env-file .env.monitoring -f docker-compose.monitoring.yml up -d
```
---
## ❌ WRONG WAY
DO NOT run this from the project root:

```bash
docker compose -f monitoring/docker-compose.monitoring.yml up -d
```

Possible problem:

```txt
monitoring/monitoring/.env.monitoring not found
```

This causes:

* empty SMTP variables
* Grafana authentication failure
* alert notifications not working
* missing admin credentials

---

# =========================================================
# 📦 CHECK RUNNING CONTAINERS
# =========================================================
```bash
docker ps
```
---
# =========================================================
# 📜 CHECK CONTAINER LOGS
# =========================================================

## Loki Logs

```bash
docker logs ict-loki
```

## Promtail Logs

```bash
docker logs ict-promtail
```

## Grafana Logs

```bash
docker logs ict-grafana
```

## Prometheus Logs

```bash
docker logs ict-prometheus
```

---

# =========================================================
# 🔄 RESTART MONITORING STACK
# =========================================================

```bash
cd monitoring
```

```bash
docker compose --env-file .env.monitoring -f docker-compose.monitoring.yml restart
```

---

# =========================================================
# ⚠️ GRAFANA PERSISTENCE & SAFETY NOTES
# =========================================================

Grafana stores ALL dashboards and monitoring configuration
inside:

```txt
/var/lib/grafana
```

If the persistent storage is deleted,
ALL dashboards and monitoring configuration are lost.

This includes:

* dashboards
* panel layouts
* Grafana users
* sessions
* datasource configurations
* alert rules
* alert history
* notification policies
* contact points
* monitoring settings
* annotations
* alert templates

---

# =========================================================
# 🚨 CRITICAL WARNING — DO NOT DELETE GRAFANA DATA
# =========================================================

# ⚠️ WAG IPATAKBO PARA HINDI MABURA ANG DASHBOARDS

These commands can permanently delete Grafana dashboards
and monitoring configuration.

---

## ❌ EXTREMELY DANGEROUS

```bash
docker compose down -v
```

Reason:

```txt
-v = delete Docker volumes
```

Deleting the Grafana volume means deleting:

* dashboards
* alert rules
* users
* settings
* Grafana database

---

## ❌ EXTREMELY DANGEROUS

```bash
docker volume rm grafana-storage
```

Reason:

```txt
grafana-storage contains the Grafana database
```

Deleting it permanently removes Grafana data.

---
## ❌ DO NOT DELETE THIS FOLDER RANDOMLY

```txt
monitoring/grafana-data
```

That folder contains persistent Grafana storage.

---

# =========================================================
# ✅ SAFE COMMANDS
# =========================================================

These commands are SAFE.

They preserve Grafana dashboards and monitoring configuration.

---

## Stop Monitoring Stack

```bash
cd monitoring
```

```bash
docker compose --env-file .env.monitoring -f docker-compose.monitoring.yml stop
```

---

## Start Monitoring Stack

```bash
cd monitoring
```

```bash
docker compose --env-file .env.monitoring -f docker-compose.monitoring.yml start
```

---

## Restart Monitoring Stack

```bash
cd monitoring
```

```bash
docker compose --env-file .env.monitoring -f docker-compose.monitoring.yml restart
```

---

## Shutdown Containers Safely

```bash
cd monitoring
```

```bash
docker compose --env-file .env.monitoring -f docker-compose.monitoring.yml down
```

Safe because persistent Grafana storage is preserved.

---

# =========================================================
# 🔐 SMTP EMAIL ALERT CONFIGURATION
# =========================================================

SMTP credentials are stored in:

```txt
monitoring/.env.monitoring
```

---

## Current SMTP Variables

```env
GF_SMTP_USER=your-email@gmail.com
GF_SMTP_PASSWORD=your-app-password
```

---

# =========================================================
# ⚠️ IMPORTANT SMTP LESSON LEARNED
# =========================================================

Docker Compose variable interpolation:

```yaml
GF_SMTP_USER: ${GF_SMTP_USER}
```

DOES NOT automatically use:

```yaml
env_file:
  - .env.monitoring
```

for Docker Compose interpolation.

Correct solution:

```bash
docker compose --env-file .env.monitoring
```

This ensures:

* SMTP variables load correctly
* Grafana email notifications work
* Gmail authentication succeeds
* alert notifications send successfully

---

# =========================================================
# 🔍 VERIFY SMTP VARIABLES INSIDE CONTAINER
# =========================================================

Check SMTP environment variables:

```bash
docker exec -it ict-grafana env | findstr GF_SMTP
```

Expected result:

```txt
GF_SMTP_USER=your-email@gmail.com
GF_SMTP_PASSWORD=your-app-password
GF_SMTP_ENABLED=true
```

If values are EMPTY:

```txt
GF_SMTP_USER=
GF_SMTP_PASSWORD=
```

then Docker Compose failed to load the environment variables.

---

# =========================================================
# 📧 GRAFANA EMAIL ALERT TESTING
# =========================================================

Grafana UI:

```txt
Alerting
→ Notification configuration
→ Contact points
→ Test
```

If successful:

* Gmail notifications work
* FIRING alerts work
* RESOLVED alerts work
* brute force alerts send successfully

---

# =========================================================
# 🌐 GRAFANA BROWSER ISSUES
# =========================================================

If Grafana containers are running but the browser shows:

* blank page
* ERR_EMPTY_RESPONSE
* repeated login prompts
* infinite loading
* login loop

verify Grafana first using terminal.

---

## Test Grafana Using CURL

```bash
curl http://localhost:3000
```

OR PowerShell:

```powershell
Invoke-WebRequest http://localhost:3000
```

If the response contains:

```html
<!DOCTYPE html>
```

then Grafana itself is healthy.

The issue is usually:

* browser cache
* stale sessions
* corrupted cookies
* old dashboard URLs

---

# =========================================================
# 🌐 USE THIS URL
# =========================================================

Use:

```txt
http://127.0.0.1:3000/login
```

Avoid using:

* old bookmarked URLs
* stale dashboard links
* broken localhost sessions

---

# =========================================================
# 📦 GRAFANA PERSISTENT STORAGE
# =========================================================

Current persistence configuration:

```yaml
volumes:
  - ./grafana-data:/var/lib/grafana
```

This ensures Grafana data survives:

* container restarts
* Docker restarts
* compose down
* system reboot

---

# =========================================================
# 🚫 NEVER MOUNT RANDOM PATHS OVER GRAFANA DATA
# =========================================================

DO NOT replace:

```yaml
- ./grafana-data:/var/lib/grafana
```

with random paths unless properly configured.

Possible problems:

* corrupted Grafana database
* startup failure
* permission errors
* lost dashboards
* broken alert rules

---

# =========================================================
# 🔍 VERIFY GRAFANA STORAGE
# =========================================================

Check mounted Grafana folder:

```bash
docker inspect ict-grafana
```

Verify:

```txt
/var/lib/grafana
```

is correctly mounted.

---

# =========================================================
# 🧨 WHY DASHBOARDS WERE LOST BEFORE
# =========================================================

Possible causes:

* using `docker compose down -v`
* deleting Docker volumes manually
* broken persistence mount
* malformed Docker Compose configuration
* corrupted bind mounts
* deleting `grafana-data`
* recreating containers without persistence

---

# =========================================================
# 🔐 GRAFANA LOGIN
# =========================================================

Configured in:

```txt
monitoring/.env.monitoring
```

and:

```txt
monitoring/grafana.ini
```


---

# =========================================================
# 💾 IMPORTANT GIT COMMIT
# =========================================================

After confirming:

* Grafana persistence works
* SMTP notifications work
* email alerts work
* brute force detection works
* dashboards survive restart

create a rollback point:

```bash
git add .
```

```bash
git commit -m "fix: monitoring smtp alerts and persistent grafana configuration"
```

---

# =========================================================
# ✅ FINAL IMPORTANT REMINDERS
# =========================================================

NEVER RUN:

```bash
docker compose down -v
```

NEVER RUN:

```bash
docker volume rm grafana-storage
```

NEVER DELETE:

```txt
monitoring/grafana-data
```

NEVER FORGET:

```bash
--env-file .env.monitoring
```

because:

* SMTP alerts depend on it
* Grafana authentication depends on it
* admin credentials depend on it
* monitoring configuration depends on it

AND ALWAYS RUN DOCKER COMPOSE INSIDE:

```txt
ICT-LIBRARY-OFFICE/monitoring
```
