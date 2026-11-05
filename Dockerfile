# ---------- Etapa 1: compilar el frontend (React + Vite) ----------
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- Etapa 2: servidor (Node + Express) ----------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# Copia solo el resultado compilado de la etapa 1
COPY --from=frontend /app/frontend/dist ./frontend/dist
EXPOSE 3000
CMD ["node", "index.js"]
