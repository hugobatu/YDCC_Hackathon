.PHONY: help build up down start stop restart logs status clean rebuild deploy

# Default target
help:
	@echo "Aqua Sentinel Simulation - Docker Commands"
	@echo "==========================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make build      - Build Docker image"
	@echo "  make up         - Start service in detached mode"
	@echo "  make down       - Stop and remove containers"
	@echo "  make start      - Start existing containers"
	@echo "  make stop       - Stop running containers"
	@echo "  make restart    - Restart containers"
	@echo "  make logs       - View logs (follow mode)"
	@echo "  make status     - Check service status"
	@echo "  make clean      - Remove containers, networks, and images"
	@echo "  make rebuild    - Rebuild and restart service"
	@echo "  make deploy     - Full deployment (build + up)"
	@echo ""

# Build Docker image
build:
	@echo "Building Docker image..."
	docker-compose build

# Start service in detached mode
up:
	@echo "Starting service..."
	docker-compose up -d
	@echo "Service started successfully!"
	@echo "Run 'make logs' to view logs"

# Stop and remove containers
down:
	@echo "Stopping service..."
	docker-compose down

# Start existing containers
start:
	@echo "Starting containers..."
	docker-compose start

# Stop running containers
stop:
	@echo "Stopping containers..."
	docker-compose stop

# Restart containers
restart:
	@echo "Restarting containers..."
	docker-compose restart

# View logs in follow mode
logs:
	docker-compose logs -f

# Check service status
status:
	@echo "Service Status:"
	docker-compose ps
	@echo ""
	@echo "Resource Usage:"
	docker stats --no-stream aqua-sentinel-simulation || true

# Clean up everything
clean:
	@echo "Cleaning up containers, networks, and images..."
	docker-compose down -v --rmi all
	@echo "Cleaned successfully!"

# Rebuild and restart
rebuild:
	@echo "Rebuilding and restarting service..."
	docker-compose up -d --build
	@echo "Service rebuilt and restarted!"

# Full deployment
deploy:
	@echo "Deploying service..."
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found!"; \
		echo "Please copy .env.example to .env and configure it"; \
		exit 1; \
	fi
	docker-compose build
	docker-compose up -d
	@echo ""
	@echo "Deployment complete!"
	@echo "Waiting for service to start..."
	@sleep 3
	@docker-compose ps
	@echo ""
	@echo "View logs with: make logs"
