#!/bin/bash

# Manual Deployment Script for Gang Run Printing
# Password: Papi2024

echo "🚀 Gang Run Printing - Manual Deployment Steps"
echo "=============================================="
echo ""
echo "Server Details:"
echo "IP: 72.60.28.175"
echo "Password: Papi2024"
echo "Port: 3100"
echo ""
echo "Step 1: Create deployment package"
echo "----------------------------------"

# Build the project
npm run build

# Create deployment package
tar -czf deploy.tar.gz \
  dist \
  package.json \
  package-lock.json \
  vite.config.ts \
  tsconfig.json \
  postcss.config.js \
  tailwind.config.ts \
  nginx-gangrun.conf \
  setup-server.sh

echo "✅ Deployment package created: deploy.tar.gz"
echo ""
echo "Step 2: Upload to server"
echo "------------------------"
echo "Run this command and enter password when prompted (Papi2024):"
echo ""
echo "scp deploy.tar.gz root@72.60.28.175:/tmp/"
echo ""
echo "Step 3: Connect to server and deploy"
echo "------------------------------------"
echo "Run this command and enter password when prompted (Papi2024):"
echo ""
echo "ssh root@72.60.28.175"
echo ""
echo "Step 4: Once connected, run these commands on the server:"
echo "---------------------------------------------------------"
cat << 'EOF'
# Create project directory
mkdir -p /var/www/gangrunprinting
cd /var/www/gangrunprinting

# Extract files
tar -xzf /tmp/deploy.tar.gz

# Install serve globally
npm install -g serve

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [{
    name: 'gangrunprinting',
    script: 'serve',
    args: 'dist -p 3100 -s',
    env: {
      NODE_ENV: 'production',
      PORT: 3100
    }
  }]
}
EOFPM2

# Stop existing process if running
pm2 stop gangrunprinting 2>/dev/null || true
pm2 delete gangrunprinting 2>/dev/null || true

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set up Nginx
cp nginx-gangrun.conf /etc/nginx/sites-available/gangrunprinting
ln -sf /etc/nginx/sites-available/gangrunprinting /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Clean up
rm /tmp/deploy.tar.gz

echo "✅ Deployment complete!"
echo "Test at: http://72.60.28.175:3100"
echo "Or via domain (if DNS configured): http://gangrunprinting.com"
EOF

echo ""
echo "Step 5: Set up SSL (optional, after DNS is configured)"
echo "------------------------------------------------------"
echo "certbot --nginx -d gangrunprinting.com -d www.gangrunprinting.com"