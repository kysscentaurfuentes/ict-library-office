# ICT-LIBRARY-OFFICE/monitoring/docker-exporter/Dockerfile

FROM python:3.12-slim

LABEL app.version="1.0.0"

WORKDIR /app

RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

COPY REQUIREMENTS.txt .

RUN pip install --no-cache-dir -r REQUIREMENTS.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]