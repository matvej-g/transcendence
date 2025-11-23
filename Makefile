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

re: down build up

help:
	@echo "Available targets:"
	@echo "  all          - Start containers (alias for 'up')"
	@echo "  build        - Build all images without cache"
	@echo "  up           - Start containers in detached mode"
	@echo "  down         - Stop containers"
	@echo "  clean        - Stop containers, remove volumes, local images and orphans"
	@echo "  clean_cache  - Aggressively clean all Docker caches, images and volumes"
	@echo "  re           - Rebuild and restart everything"
	@echo "  help         - Show this help"

.PHONY: all up build down clean clean_cachere help re