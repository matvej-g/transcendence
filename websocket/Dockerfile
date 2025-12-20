FROM php:8.1-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# Composer Dependencies werden beim Build installiert
COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-dev --optimize-autoloader || composer install --no-dev

COPY backend/ ./

EXPOSE 8080

CMD ["php", "src/game_app/server.php"]