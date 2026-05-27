# frontend/Dockerfile
# =========================================
# STAGE 1 — Build React/Vite App
# =========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./

RUN npm ci

# Copy source code
COPY . .

# =========================================
# Build-time Environment Variables
# Required for Vite production build
# =========================================
ARG VITE_API_URL
ARG VITE_API_FALLBACK

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_FALLBACK=$VITE_API_FALLBACK

# Build production frontend
RUN npm run build

# =========================================
# STAGE 2 — Serve with Nginx
# =========================================
FROM nginx:stable-alpine

# Copy built frontend files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]