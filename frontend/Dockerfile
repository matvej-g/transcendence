# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Install TypeScript and build
RUN npm install -D typescript @types/node
RUN npx tsc --build

# Stage 2: Production
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy static files
COPY --from=builder /app/public/ .

# Copy compiled TypeScript files
COPY --from=builder /app/dist ./dist

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
