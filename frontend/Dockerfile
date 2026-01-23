# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy source code (including config files and input.css)
COPY . .

# Install TypeScript and Tailwind, init config, build CSS
RUN npm install -D typescript @types/node tailwindcss postcss autoprefixer
RUN npx tailwindcss init -p
RUN npx tailwindcss -i ./src/input.css -o ./public/tailwind.css
RUN npx tsc --build

# Stage 2: Production
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy static files
COPY --from=builder /app/public/ .

# Copy compiled TypeScript files
COPY --from=builder /app/dist ./dist

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

#---- recommended approach with external nginx ---
# FROM node:18-alpine AS builder

# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production
# COPY . .
# RUN npm run build

# FROM node:18-alpine AS runtime
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY package*.json ./
# RUN npm ci --only=production
# CMD ["npm", "start"]
