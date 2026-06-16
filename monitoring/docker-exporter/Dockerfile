# ICT-LIBRARY-OFFICE/monitoring/docker-exporter/Dockerfile

FROM python:3.12-slim

WORKDIR /app

COPY REQUIREMENTS.txt .

RUN pip install --no-cache-dir -r REQUIREMENTS.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]