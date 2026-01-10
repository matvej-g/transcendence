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

# Check if database has tables (not just if file exists)
if [ ! -f "$DB_FILE" ] || [ ! -s "$DB_FILE" ]; then
    echo -e "${GREEN}Creating database $DB_FILE and applying schema...${NC}"
    rm -f "$DB_FILE"  # Remove if exists but empty
    sudo -u www-data sqlite3 "$DB_FILE" < "$SCHEMA"
    chown www-data:www-data "$DB_FILE"
else
    # Check if database has tables
    TABLE_COUNT=$(sudo -u www-data sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
    if [ "$TABLE_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}Database exists but is empty. Applying schema...${NC}"
        sudo -u www-data sqlite3 "$DB_FILE" < "$SCHEMA"
    else
        echo -e "${YELLOW}Database already exists with $TABLE_COUNT tables. Skipping schema.${NC}"
    fi
fi

# ensure avatars folder and default avatar
mkdir -p "$DIR/uploads/avatars"
chown -R www-data:www-data "$DIR/uploads/avatars"
echo -e "${GREEN}Creating dir $DIR/uploads/avatars"
if [ ! -f "$DIR/uploads/avatars/default.jpg" ]; then
    cp "$DIR/public/default.jpg" "$DIR/uploads/avatars/default.jpg"
	echo -e "${GREEN}Copying default avatar from $DIR/public/default.jpg"
fi

exec php-fpm
