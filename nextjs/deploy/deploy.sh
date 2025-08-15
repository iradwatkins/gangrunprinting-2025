#!/bin/bash

# Gang Run Printing - PostgreSQL Deployment Script
# Server: 72.60.28.175:3100

set -e

echo "🚀 Gang Run Printing - PostgreSQL Deployment"
echo "==========================================="

# Configuration
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PORT="22"
APP_DIR="/opt/gangrunprinting"
BACKUP_DIR="/opt/backups/gangrunprinting"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Build the application locally
print_status "Building Next.js application..."
cd ..
npm run build

# Step 2: Create deployment package
print_status "Creating deployment package..."
tar -czf deploy/gangrun-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next/cache' \
    --exclude='*.log' \
    --exclude='.env.local' \
    .

# Step 3: Copy files to server
print_status "Copying files to server..."
scp -P ${SERVER_PORT} deploy/gangrun-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/
scp -P ${SERVER_PORT} deploy/docker-compose.yml ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/
scp -P ${SERVER_PORT} deploy/.env.production ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/.env

# Step 4: Connect to server and deploy
print_status "Connecting to server and deploying..."
ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    set -e
    
    cd /opt/gangrunprinting
    
    # Backup current deployment
    echo "Creating backup..."
    mkdir -p /opt/backups/gangrunprinting
    if [ -d "current" ]; then
        tar -czf /opt/backups/gangrunprinting/backup-$(date +%Y%m%d-%H%M%S).tar.gz current/
    fi
    
    # Extract new deployment
    echo "Extracting new deployment..."
    mkdir -p new-deployment
    tar -xzf gangrun-deploy.tar.gz -C new-deployment
    
    # Stop current containers
    echo "Stopping current containers..."
    docker-compose down || true
    
    # Move new deployment to current
    echo "Switching to new deployment..."
    rm -rf current
    mv new-deployment current
    
    # Copy Docker files
    cp docker-compose.yml current/
    cp .env current/
    
    # Start new containers
    echo "Starting new containers..."
    cd current
    docker-compose up -d --build
    
    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10
    
    # Run database migrations
    echo "Running database migrations..."
    docker-compose exec -T nextjs npx prisma migrate deploy
    
    # Health check
    echo "Performing health check..."
    curl -f http://localhost:3100 || exit 1
    
    echo "✅ Deployment successful!"
ENDSSH

print_status "Deployment complete!"
echo ""
echo "📋 Deployment Summary:"
echo "  - Server: ${SERVER_IP}:3100"
echo "  - Application: https://gangrunprinting.com"
echo "  - Database: PostgreSQL (Dockerized)"
echo "  - Storage: Local filesystem"
echo ""
echo "📌 Next Steps:"
echo "  1. Update DNS to point to ${SERVER_IP}"
echo "  2. Configure SSL certificate"
echo "  3. Set up monitoring"
echo "  4. Configure backups"