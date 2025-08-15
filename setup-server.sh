#!/bin/bash

# Server Setup Script for Gang Run Printing
# This script sets up nginx and SSL on the server

echo "🔧 Setting up Gang Run Printing on server..."

# Configuration
DOMAIN="gangrunprinting.com"
EMAIL="admin@gangrunprinting.com"  # Update this with your email

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Setting up Nginx configuration...${NC}"

# Copy nginx config
sudo cp nginx-gangrun.conf /etc/nginx/sites-available/gangrunprinting

# Enable the site
sudo ln -sf /etc/nginx/sites-available/gangrunprinting /etc/nginx/sites-enabled/

# Test nginx configuration
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
    
    # Reload nginx
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
    
    # Set up SSL with Let's Encrypt
    echo -e "${YELLOW}Setting up SSL certificate...${NC}"
    echo -e "${YELLOW}Make sure your domain points to IP: 72.60.28.175${NC}"
    read -p "Is your domain configured? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ SSL certificate installed successfully${NC}"
            echo -e "${GREEN}Your site is now available at: https://${DOMAIN}${NC}"
        else
            echo -e "${RED}❌ SSL setup failed. You can try again with: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
        fi
    else
        echo -e "${YELLOW}Skipping SSL setup. You can set it up later with:${NC}"
        echo "sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
    fi
else
    echo -e "${RED}❌ Nginx configuration has errors. Please fix them first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Ensure DNS A records point to: 72.60.28.175"
echo "2. Access your site at: http://${DOMAIN}:3100 (before nginx)"
echo "3. Access your site at: http://${DOMAIN} (through nginx)"
echo "4. After SSL: https://${DOMAIN}"