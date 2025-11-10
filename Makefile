PROJECT_NAME := transcendence
DC := docker compose -p $(PROJECT_NAME)

all: up

build:
	$(DC) build --no-cache

up:
	$(DC) up -d

down:
	$(DC) down

clean:
	$(DC) down -v --rmi local --remove-orphans

clean_cache:
	docker system prune -a --volumes -f
	docker buildx prune --all --force

re: up

.PHONY: all up build down clean clean_cachere