# 📌 DEV NOTES (ICT Library Office)
## 🧑‍💻 Development Mode
Run this when actively coding:

```bash
npm run dev

Run this when deploying or testing production build:
npm run build
npm start

#===================================================
If there is changes on:
Dockerfile
package.json
docker-compose.yml
docker compose down 

run then:
docker compose up --build
#===================================================
docker containers:
enter backend container:
docker exec -it ict-backend sh

check files:
ls

check uploads:
ls uploads

check node module exists:
ls node_modules

container quit
exit

