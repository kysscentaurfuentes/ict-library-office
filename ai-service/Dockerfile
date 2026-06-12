# ICT-LIBRARY-OFFICE/ai-service/Dockerfile

FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY REQUIREMENTS.txt .

RUN pip install --no-cache-dir \
    torch torchvision \
    --index-url https://download.pytorch.org/whl/cpu

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r REQUIREMENTS.txt

COPY . .

EXPOSE 5000

CMD ["python", "flask_stream.py"]