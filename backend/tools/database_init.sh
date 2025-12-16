#!/bin/bash

DIR='/var/www/html'
DB_DIR="$DIR/database"
DB_FILE="$DB_DIR/transcendence.db"
SCHEMA="$DIR/tools/sqlite_init.sql"

# === ANSI Colors ===
RED='\033[0;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

#dir creation and permissions
mkdir -p "$DB_DIR"
chown -R www-data:www-data "$DB_DIR"
chmod 2755 "$DB_DIR"
# try with 755

# not sure if exiting is a good idea
if [ ! -f "$SCHEMA" ]; then
	echo -e "${RED}$SCHEMA missing! exiting...${NC}"
	exit 1;
else
	echo -e "${GREEN}$SCHEMA exists!${NC}";
fi

# test this
if [ ! -f "$DB_FILE" ]; then
    echo -e "${GREEN}Creating database $DB_FILE and applying schema...${NC}"
	sudo -u www-data sqlite3 "$DB_FILE" < "$SCHEMA"
    chown www-data:www-data "$DB_FILE"
else
    echo -e "${YELLOW}Database already exists. Skipping schema.${NC}"
fi

exec php-fpm
