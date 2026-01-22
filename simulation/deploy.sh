#!/bin/bash

# Aqua Sentinel Simulation - Quick Deployment Script for Ubuntu VPS
# This script automates the deployment process

set -e  # Exit on any error

echo "🐋 Aqua Sentinel Simulation - Docker Deployment Script"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Docker is installed
echo ""
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi
print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    echo "Run: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "Then: sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi
print_success "Docker Compose is installed"

# Check if .env file exists
echo ""
if [ ! -f .env ]; then
    print_warning ".env file not found!"
    echo "Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your database credentials:"
        echo "  nano .env"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        print_error ".env.example file not found. Cannot proceed."
        exit 1
    fi
else
    print_success ".env file exists"
fi

# Check if database credentials are set
echo ""
echo "Validating .env configuration..."
source .env

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "your_password_here" ]; then
    print_error "Database password not set in .env file!"
    echo "Please edit .env and set your actual database password."
    exit 1
fi
print_success "Database credentials configured"

# Build Docker image
echo ""
echo "Building Docker image..."
if docker-compose build; then
    print_success "Docker image built successfully"
else
    print_error "Failed to build Docker image"
    exit 1
fi

# Start the service
echo ""
echo "Starting the service..."
if docker-compose up -d; then
    print_success "Service started successfully"
else
    print_error "Failed to start service"
    exit 1
fi

# Wait a moment for the service to start
sleep 3

# Check service status
echo ""
echo "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_success "Service is running"
    
    echo ""
    echo "======================================================"
    echo "🎉 Deployment successful!"
    echo "======================================================"
    echo ""
    echo "Service is now running and will generate water quality data every 5 minutes."
    echo ""
    echo "Useful commands:"
    echo "  • View logs:           docker-compose logs -f"
    echo "  • Stop service:        docker-compose stop"
    echo "  • Start service:       docker-compose start"
    echo "  • Restart service:     docker-compose restart"
    echo "  • Check status:        docker-compose ps"
    echo "  • Stop & remove:       docker-compose down"
    echo ""
    echo "View logs now?"
    read -p "Press 'y' to view logs, or any other key to exit: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose logs -f
    fi
else
    print_error "Service is not running properly"
    echo "Checking logs..."
    docker-compose logs --tail=50
    exit 1
fi
