# BACKEND/docs/internal/vps-deployment-checklist.md

# ICT LIBRARY OFFICE VPS DEPLOYMENT CHECKLIST

## Required VPS Specifications

- Ubuntu 24.04 LTS
- Minimum 4GB RAM
- Docker Engine
- Docker Compose
- Git
- Nginx
- Domain Name
- SSL Certificate

---

## Initial VPS Setup

```bash
sudo apt update && sudo apt upgrade -y


curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
docker login ghcr.io

Those are for:
✅ FUTURE VPS
✅ Ubuntu Linux server
✅ cloud VM