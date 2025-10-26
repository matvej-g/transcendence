PROJECT_NAME := transcendence

all: build run

build:
	@echo "🛠️  Building Docker images without cache..."
	docker compose build --no-cache --pull

run:
	@echo "🚀 Starting containers..."
	docker compose up -d --force-recreate

stop:
	@echo "🧩 Stopping and removing containers..."
	docker compose down --remove-orphans

clean:
	@echo "🧹 Removing containers, images, volumes, and build cache..."
	docker compose down --rmi all --volumes --remove-orphans
	docker builder prune -af
	docker system prune -af --volumes
	@echo "✅ All Docker resources for $(PROJECT_NAME) cleaned."

re: clean all

.PHONY: all build run stop clean re



# Stop and remove containers (and orphans)
#docker compose down --remove-orphans

# Remove images used by this compose project
#docker compose down --rmi all

# (Optional) also wipe build cache from BuildKit
#docker builder prune -a

# (Optional) deep clean everything unused
#docker system prune -af --volumes

# Rebuild from scratch, no cache, pull latest base images
#docker compose build --no-cache --pull

# Start clean containers
#docker compose up -d --force-recreate