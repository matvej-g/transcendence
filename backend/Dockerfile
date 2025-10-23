FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# COPY php app files
COPY . /var/www/html/

# EXPOSE 8000

# CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]