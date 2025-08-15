#!/bin/bash

# Gang Run Printing Deployment Script
# Server: 72.60.28.175
# Port: 3100 (allocated for this project)

echo "🚀 Deploying Gang Run Printing to VPS..."

# Configuration
SERVER_IP="72.60.28.175"
SERVER_USER="root"
PROJECT_NAME="gangrunprinting"
REMOTE_DIR="/var/www/gangrunprinting"
PORT="3100"
DOMAIN="gangrunprinting.com"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building project...${NC}"
npm run build

echo -e "${YELLOW}Creating deployment package...${NC}"
# Create a deployment package (only include existing files)
tar -czf deploy.tar.gz \
  dist/* \
  package.json \
  package-lock.json \
  vite.config.ts \
  tsconfig.json \
  postcss.config.js \
  tailwind.config.ts

echo -e "${YELLOW}Uploading to server...${NC}"
# Upload to server
scp deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

echo -e "${YELLOW}Deploying on server...${NC}"
# SSH to server and deploy
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
  # Create project directory
  mkdir -p /var/www/gangrunprinting
  cd /var/www/gangrunprinting
  
  # Extract files
  tar -xzf /tmp/deploy.tar.gz
  
  # Install dependencies
  npm install --production
  
  # Create PM2 ecosystem file
  cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'gangrunprinting',
    script: 'npx',
    args: 'serve dist -p 3100',
    env: {
      NODE_ENV: 'production',
      PORT: 3100
    },
    error_file: '/var/log/gangrunprinting/error.log',
    out_file: '/var/log/gangrunprinting/out.log',
    time: true
  }]
}
EOF
  
  # Create log directory
  mkdir -p /var/log/gangrunprinting
  
  # Install serve globally if not present
  npm install -g serve
  
  # Stop existing process if running
  pm2 stop gangrunprinting 2>/dev/null || true
  pm2 delete gangrunprinting 2>/dev/null || true
  
  # Start with PM2
  pm2 start ecosystem.config.js
  pm2 save
  
  echo "✅ Application deployed and running on port 3100"
  
  # Clean up
  rm /tmp/deploy.tar.gz
ENDSSH

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "Application running at: http://${SERVER_IP}:${PORT}"
echo "Next steps:"
echo "1. Configure nginx for domain: ${DOMAIN}"
echo "2. Set up SSL certificate with Let's Encrypt"