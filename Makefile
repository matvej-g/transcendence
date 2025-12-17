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

<<<<<<< HEAD
re: up

.PHONY: all up build down clean clean_cachere
=======
re: down build up

frontend: ## Start only the frontend container
	$(DC) up -d frontend

nginx: ## Start only the nginx container
	$(DC) up -d nginx

php-backend: ## Start only the PHP backend container
	$(DC) up -d php-backend

re-frontend: ## Rebuild and restart only the frontend container
	$(DC) build --no-cache frontend
	$(DC) up -d frontend

re-nginx: ## Rebuild and restart only the nginx container
	$(DC) build --no-cache nginx
	$(DC) up -d nginx

re-php-backend: ## Rebuild and restart only the PHP backend container
	$(DC) build --no-cache php-backend
	$(DC) up -d php-backend


help:
	@echo "Available targets:"
	@echo "  all           - Start containers (alias for 'up')"
	@echo "  build         - Build all images without cache"
	@echo "  up            - Start all containers in detached mode"
	@echo "  down          - Stop all containers"
	@echo "  clean         - Stop containers, remove volumes, local images and orphans"
	@echo "  clean_cache   - Aggressively clean all Docker caches, images and volumes"
	@echo "  re            - Rebuild and restart everything"
	@echo "  frontend      - Start only the frontend container"
	@echo "  nginx         - Start only the nginx container"
	@echo "  php-backend   - Start only the PHP backend container"
	@echo "  re-frontend   - Rebuild and restart only the frontend container"
	@echo "  re-nginx      - Rebuild and restart only the nginx container"
	@echo "  re-php-backend- Rebuild and restart only the PHP backend container"
	@echo "  help          - Show this help"

.PHONY: all up build down clean clean_cache help re frontend nginx php-backend re-frontend re-nginx re-php-backend
>>>>>>> origin/main
