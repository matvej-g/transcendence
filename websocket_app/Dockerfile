# websocket_app/Dockerfile
FROM php:8.1-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    && docker-php-ext-install pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# install composer deps needed by Ratchet/React
COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-dev --optimize-autoloader || composer install --no-dev

# copy backend source (includes src/app_ws/Server.php)
COPY backend/ ./

# app-ws listens on 8082 (match nginx proxy_pass)
EXPOSE 8082

CMD ["php", "src/app_ws/Server.php"]