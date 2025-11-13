FROM node:18-alpine AS builder

WORKDIR /app


# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Install TypeScript
RUN npm install -D typescript

# Build TypeScript and verify dist directory
RUN npx tsc
 # Verify dist directory exists
# RUN  mkdir /app/dist

# Production stage
FROM nginx:alpine
COPY --from=builder /app/site/public/ /usr/share/nginx/html/
# copy comiled files from dist into html directory
# in tsconfig.json it is specified that they should go to dist
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
