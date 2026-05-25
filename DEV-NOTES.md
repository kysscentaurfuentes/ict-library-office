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
#===================================================
docker builder prune -a
docker compose up --build
