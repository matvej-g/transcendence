FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    sudo \
    sqlite3 \
    libsqlite3-dev \
	unzip \
	git \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html


# Copy composer files and install dependencies first for better caching
COPY composer.json composer.lock /var/www/html/
RUN composer install --no-dev --optimize-autoloader

COPY . /var/www/html/

RUN chmod +x /var/www/html/tools/database_init.sh
ENTRYPOINT ["/var/www/html/tools/database_init.sh"]

