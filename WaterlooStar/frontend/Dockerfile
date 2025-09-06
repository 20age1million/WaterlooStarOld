# syntax=docker/dockerfile:1

# ---- Build stage ------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# 1) Install ALL deps (incl. dev) so TS/types & tools exist
COPY package*.json ./
RUN npm ci

# 2) Copy source and build
COPY . .
# Avoid CRA prompts + enable CI mode
ENV CI=true
RUN npm run build

# ---- Runtime stage (nginx) --------------------------------------------------
FROM nginx:alpine AS production
# If you don't actually have nginx.conf in the repo, remove the next line or add the file.
# COPY nginx.conf /etc/nginx/nginx.conf

# CRA outputs to /app/build (Vite uses /app/dist — adjust if needed)
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
