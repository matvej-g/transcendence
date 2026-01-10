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

# exists container if no schema exists
if [ ! -f "$SCHEMA" ]; then
	echo -e "${RED}$SCHEMA missing! exiting...${NC}"
	exit 1;
else
	echo -e "${GREEN}$SCHEMA exists!${NC}";
fi

echo -e "${GREEN}Applying schema to $DB_FILE (idempotent)...${NC}"
sudo -u www-data sqlite3 "$DB_FILE" < "$SCHEMA"
chown www-data:www-data "$DB_FILE"

DEFAULT_AVATAR_SRC="$DIR/public/assets/default.jpg"
DEFAULT_AVATAR_DST="$DIR/uploads/avatars/default.jpg"

mkdir -p "$DIR/uploads/avatars"
chown -R www-data:www-data "$DIR/uploads/avatars"
echo -e "${GREEN}Ensuring dir $DIR/uploads/avatars exists${NC}"

if [ ! -f "$DEFAULT_AVATAR_SRC" ]; then
    echo -e "${YELLOW}Warning: $DEFAULT_AVATAR_SRC missing, no default avatar will be copied.${NC}"
else
    if [ ! -f "$DEFAULT_AVATAR_DST" ]; then
        cp "$DEFAULT_AVATAR_SRC" "$DEFAULT_AVATAR_DST"
        echo -e "${GREEN}Copying default avatar from $DEFAULT_AVATAR_SRC${NC}"
    fi
fi

exec php-fpm
