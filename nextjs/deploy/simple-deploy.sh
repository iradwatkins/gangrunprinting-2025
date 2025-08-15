#!/bin/bash

# Simple Deployment Script for Gang Run Printing (PostgreSQL Version)
# For server: 72.60.28.175:3100

echo "🚀 Gang Run Printing - Simple PostgreSQL Deployment"
echo "=================================================="

# Step 1: Build the application
echo "Building Next.js application..."
cd ..
npm run build

# Step 2: Create deployment package
echo "Creating deployment package..."
rm -f deploy/gangrun-simple.zip
zip -r deploy/gangrun-simple.zip . \
    -x "node_modules/*" \
    -x ".git/*" \
    -x ".next/cache/*" \
    -x "*.log" \
    -x ".env.local" \
    -x "deploy/*"

echo ""
echo "📦 Deployment package created: gangrun-simple.zip"
echo ""
echo "📋 Manual Deployment Steps:"
echo "=========================="
echo ""
echo "1. Copy the package to server:"
echo "   scp deploy/gangrun-simple.zip root@72.60.28.175:/opt/"
echo "   Password: Papi2024"
echo ""
echo "2. SSH into the server:"
echo "   ssh root@72.60.28.175"
echo "   Password: Papi2024"
echo ""
echo "3. On the server, run these commands:"
echo ""
cat << 'EOF'
   # Install PostgreSQL
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib
   
   # Create database and user
   sudo -u postgres psql << SQL
   CREATE USER gangrun WITH PASSWORD 'GangRun2024!';
   CREATE DATABASE gangrunprinting OWNER gangrun;
   GRANT ALL PRIVILEGES ON DATABASE gangrunprinting TO gangrun;
   SQL
   
   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   npm install -g pm2
   
   # Setup application
   cd /opt
   rm -rf gangrunprinting
   mkdir gangrunprinting
   cd gangrunprinting
   unzip ../gangrun-simple.zip
   
   # Install dependencies
   npm install
   cd shared && npm install && cd ..
   
   # Setup environment
   cat > .env << ENV
   DATABASE_URL=postgresql://gangrun:GangRun2024!@localhost:5432/gangrunprinting
   NEXTAUTH_URL=http://72.60.28.175:3100
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   NODE_ENV=production
   PORT=3100
   ENV
   
   # Generate Prisma client and run migrations
   npx prisma generate
   npx prisma migrate deploy
   
   # Build the application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "gangrun" -- start -- --port 3100
   pm2 save
   pm2 startup
   
   # Configure firewall
   sudo ufw allow 3100
   
   echo "✅ Deployment complete!"
   echo "Application running at: http://72.60.28.175:3100"
EOF

echo ""
echo "4. Verify deployment:"
echo "   curl http://72.60.28.175:3100"
echo ""
echo "5. Monitor logs:"
echo "   pm2 logs gangrun"
echo ""
echo "📌 PM2 Commands:"
echo "   pm2 status       - Check app status"
echo "   pm2 restart all  - Restart application"
echo "   pm2 logs         - View logs"
echo "   pm2 monit        - Monitor resources"