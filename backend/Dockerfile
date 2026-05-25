# backend/Dockerfile
FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]