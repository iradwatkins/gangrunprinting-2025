#!/bin/bash

echo "🔧 SteppersLife Immediate Fix Script"
echo "====================================="
echo ""

# Fix 1: Start the auth and storage services
echo "📦 Step 1: Starting Auth & Storage Services..."

# Check if auth service is running
if ! lsof -i:3010 > /dev/null 2>&1; then
    echo "Starting auth service on port 3010..."
    cd /root/stepperslife/auth-service
    nohup npm start > /var/log/auth-service.log 2>&1 &
    echo "Auth service started (PID: $!)"
    sleep 2
else
    echo "Auth service already running on port 3010"
fi

# Check if storage service is running
if ! lsof -i:3011 > /dev/null 2>&1; then
    echo "Starting storage service on port 3011..."
    cd /root/stepperslife/storage-service
    nohup npm start > /var/log/storage-service.log 2>&1 &
    echo "Storage service started (PID: $!)"
    sleep 2
else
    echo "Storage service already running on port 3011"
fi

# Fix 2: Fix the .tsx extension issue in built files
echo ""
echo "🔨 Step 2: Fixing .tsx extensions in dist folder..."
cd /root/stepperslife

# Find and rename any .tsx files to .js
if find dist -name "*.tsx" -type f 2>/dev/null | grep -q .; then
    echo "Found .tsx files in dist, fixing..."
    find dist -name "*.tsx" -type f | while read file; do
        newfile="${file%.tsx}.js"
        mv "$file" "$newfile"
        echo "  Renamed: $(basename $file) -> $(basename $newfile)"
    done
else
    echo "No .tsx files found in dist folder"
fi

# Update all HTML files to reference .js instead of .tsx
echo "Updating HTML references..."
if [ -d "dist" ]; then
    find dist -name "*.html" -type f | while read file; do
        if grep -q "\.tsx" "$file"; then
            sed -i 's/\.tsx/\.js/g' "$file"
            echo "  Updated references in: $(basename $file)"
        fi
    done
fi

# Also check and fix the index.html specifically
if [ -f "dist/index.html" ]; then
    # Look for the specific problematic file
    if grep -q "App-.*\.tsx" dist/index.html; then
        echo "Fixing App component reference..."
        sed -i 's/App-\([^"]*\)\.tsx/App-\1.js/g' dist/index.html
    fi
fi

# Fix 3: Configure nginx to proxy correctly
echo ""
echo "🌐 Step 3: Updating nginx configuration..."

cat > /etc/nginx/sites-available/stepperslife << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name stepperslife.com www.stepperslife.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stepperslife.com www.stepperslife.com;

    ssl_certificate /etc/letsencrypt/live/stepperslife.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stepperslife.com/privkey.pem;

    root /root/stepperslife/dist;
    index index.html;

    # JavaScript files with correct MIME type
    location ~ \.js$ {
        add_header Content-Type application/javascript;
        try_files $uri =404;
    }

    # CSS files
    location ~ \.css$ {
        add_header Content-Type text/css;
        try_files $uri =404;
    }

    # Auth service proxy (fixes localhost:3010 errors)
    location /auth/ {
        proxy_pass http://127.0.0.1:3010/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage service proxy
    location /storage/ {
        proxy_pass http://127.0.0.1:3011/storage/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }

    # SPA routing - must be last
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
}
EOF

# Test nginx config
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    echo "✅ Nginx configuration updated and reloaded"
else
    echo "❌ Nginx configuration has errors. Please check manually."
fi

# Fix 4: Update the frontend to use proper URLs
echo ""
echo "🔄 Step 4: Updating frontend configuration..."

# Check if the app is trying to use localhost directly
if [ -f "dist/assets/data-vendor-tgK8KFTD.js" ]; then
    echo "Updating API endpoints in compiled JavaScript..."
    # Replace localhost:3010 with relative path /auth
    sed -i 's|http://localhost:3010|/auth|g' dist/assets/*.js 2>/dev/null
    sed -i 's|https://localhost:3010|/auth|g' dist/assets/*.js 2>/dev/null
    echo "  Updated localhost references to use proxy paths"
fi

# Fix 5: Quick verification
echo ""
echo "✅ Step 5: Verifying fixes..."
echo "----------------------------"

# Check auth service
if curl -s http://localhost:3010/health > /dev/null 2>&1; then
    echo "✅ Auth service is responding"
else
    echo "⚠️  Auth service not responding - checking logs..."
    tail -n 5 /var/log/auth-service.log 2>/dev/null
fi

# Check storage service  
if curl -s http://localhost:3011/health > /dev/null 2>&1; then
    echo "✅ Storage service is responding"
else
    echo "⚠️  Storage service not responding - checking logs..."
    tail -n 5 /var/log/storage-service.log 2>/dev/null
fi

# Check for .tsx files
tsx_count=$(find dist -name "*.tsx" 2>/dev/null | wc -l)
if [ "$tsx_count" -eq 0 ]; then
    echo "✅ No .tsx files in dist folder"
else
    echo "⚠️  Still found $tsx_count .tsx files in dist"
fi

# Check nginx
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "⚠️  Nginx is not running"
fi

echo ""
echo "====================================="
echo "🎉 Immediate fixes applied!"
echo ""
echo "Please refresh https://stepperslife.com and check if:"
echo "1. The MIME type errors are gone"
echo "2. The localhost:3010 connection refused errors are gone"
echo ""
echo "If issues persist, check logs:"
echo "  tail -f /var/log/auth-service.log"
echo "  tail -f /var/log/storage-service.log"
echo "  tail -f /var/log/nginx/error.log"
echo ""
echo "To monitor all services:"
echo "  ps aux | grep -E 'auth-service|storage-service'"
