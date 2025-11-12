FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
	unzip \
	git \
    && docker-php-ext-install pdo pdo_sqlite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# COPY php app files
COPY . /var/www/html/

RUN chmod +x /var/www/html/tools/database_init.sh
ENTRYPOINT ["/var/www/html/tools/database_init.sh"]

