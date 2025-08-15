#!/bin/bash

# Complete migration script from Supabase to self-hosted PostgreSQL
# Run this on your VPS at /root/stepperslife

echo "🚀 Supabase to PostgreSQL Migration Script"
echo "=========================================="

# Configuration variables
DB_NAME="stepperslife"
DB_USER="stepperslife_user"
DB_PASSWORD="your_secure_password_here"  # Change this!
SUPABASE_URL="https://your-project.supabase.co"  # Your old Supabase URL
SUPABASE_KEY="your-supabase-service-key"  # Service key for full access

# Step 1: Install required packages
echo "Step 1: Installing required packages..."
apt-get update
apt-get install -y postgresql postgresql-contrib nginx nodejs npm python3-pip
pip3 install pgcli  # Better PostgreSQL CLI

# Step 2: Setup PostgreSQL
echo "Step 2: Setting up PostgreSQL..."
sudo -u postgres psql << EOF
-- Create database and user
CREATE DATABASE ${DB_NAME};
CREATE USER ${DB_USER} WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Enable necessary extensions (same as Supabase uses)
\c ${DB_NAME}
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
EOF

# Step 3: Export data from Supabase
echo "Step 3: Exporting data from Supabase..."
echo "Please run this on your LOCAL machine first:"
echo "----------------------------------------"
cat << 'EXPORT_SCRIPT'
# On your local machine with Supabase CLI:
npx supabase db dump --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres" > supabase_dump.sql

# Then upload to your VPS:
scp supabase_dump.sql root@148.230.93.174:/root/stepperslife/
EXPORT_SCRIPT
echo "----------------------------------------"
echo "Press Enter when you've uploaded supabase_dump.sql..."
read

# Step 4: Import data to PostgreSQL
echo "Step 4: Importing data to PostgreSQL..."
if [ -f "supabase_dump.sql" ]; then
    sudo -u postgres psql ${DB_NAME} < supabase_dump.sql
    echo "✅ Data imported successfully"
else
    echo "⚠️  supabase_dump.sql not found. Skipping import."
fi

# Step 5: Setup authentication service (replacing Supabase Auth)
echo "Step 5: Setting up authentication service..."
mkdir -p auth-service
cd auth-service

cat > package.json << 'EOF'
{
  "name": "auth-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

cat > server.js << 'EOF'
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

// Auth endpoints (Supabase-compatible)
app.post('/auth/v1/token', async (req, res) => {
  const { grant_type, email, password, refresh_token } = req.body;

  try {
    if (grant_type === 'password') {
      // Login with email/password
      const result = await pool.query(
        'SELECT * FROM auth.users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.encrypted_password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const access_token = jwt.sign(
        { sub: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const refresh_token = jwt.sign(
        { sub: user.id, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        access_token,
        refresh_token,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        }
      });
      
    } else if (grant_type === 'refresh_token') {
      // Refresh token
      try {
        const decoded = jwt.verify(refresh_token, JWT_SECRET);
        
        const access_token = jwt.sign(
          { sub: decoded.sub },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        
        res.json({
          access_token,
          refresh_token,
          user: { id: decoded.sub }
        });
      } catch (err) {
        res.status(401).json({ error: 'Invalid refresh token' });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/v1/signup', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO auth.users (email, encrypted_password, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [email, hashedPassword]
    );
    
    const user = result.rows[0];
    
    const access_token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      access_token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
EOF

cat > .env << EOF
DB_USER=${DB_USER}
DB_NAME=${DB_NAME}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=$(openssl rand -base64 32)
PORT=3010
EOF

npm install
cd ..

# Step 6: Create storage service (replacing Supabase Storage)
echo "Step 6: Setting up storage service..."
mkdir -p storage-service
cd storage-service

cat > package.json << 'EOF'
{
  "name": "storage-service",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "uuid": "^9.0.1"
  }
}
EOF

cat > server.js << 'EOF'
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;

const app = express();
app.use(cors());
app.use(express.json());

// Storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const bucket = req.params.bucket || 'default';
    const dir = path.join(__dirname, 'uploads', bucket);
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Upload endpoint (Supabase-compatible)
app.post('/storage/v1/object/:bucket/*', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const publicUrl = `${req.protocol}://${req.get('host')}/storage/v1/object/public/${req.params.bucket}/${req.file.filename}`;
  
  res.json({
    Key: req.file.filename,
    url: publicUrl
  });
});

// Serve uploaded files
app.use('/storage/v1/object/public', express.static(path.join(__dirname, 'uploads')));

// List files in bucket
app.get('/storage/v1/object/:bucket', async (req, res) => {
  const bucket = req.params.bucket;
  const dir = path.join(__dirname, 'uploads', bucket);
  
  try {
    const files = await fs.readdir(dir);
    res.json(files.map(file => ({
      name: file,
      bucket: bucket,
      created_at: new Date().toISOString()
    })));
  } catch (error) {
    res.json([]);
  }
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Storage service running on port ${PORT}`);
});
EOF

npm install
cd ..

# Step 7: Create systemd services
echo "Step 7: Creating systemd services..."

cat > /etc/systemd/system/auth-service.service << EOF
[Unit]
Description=Authentication Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/stepperslife/auth-service
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/storage-service.service << EOF
[Unit]
Description=Storage Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/stepperslife/storage-service
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable auth-service storage-service
systemctl start auth-service storage-service

# Step 8: Update nginx configuration
echo "Step 8: Configuring nginx..."

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

    # Frontend
    location / {
        root /root/stepperslife/dist;
        try_files $uri $uri/ /index.html;
    }

    # Auth service proxy
    location /auth/ {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Storage service proxy
    location /storage/ {
        proxy_pass http://localhost:3011;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }

    # REST API for database
    location /rest/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/stepperslife /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Step 9: Update frontend configuration
echo "Step 9: Updating frontend to use local services..."

cat > .env.production << 'EOF'
VITE_SUPABASE_URL=https://stepperslife.com
VITE_SUPABASE_ANON_KEY=not-needed-anymore
VITE_API_URL=https://stepperslife.com
VITE_AUTH_URL=https://stepperslife.com/auth/v1
VITE_STORAGE_URL=https://stepperslife.com/storage/v1
EOF

echo ""
echo "=========================================="
echo "✅ Migration setup complete!"
echo ""
echo "Next steps:"
echo "1. Export your Supabase data using the command shown above"
echo "2. Import it to PostgreSQL"
echo "3. Update your frontend code to use the new endpoints"
echo "4. Test authentication at https://stepperslife.com/auth/v1/health"
echo "5. Test storage at https://stepperslife.com/storage/v1/object/test"
echo ""
echo "Services status:"
systemctl status auth-service --no-pager | head -n 3
systemctl status storage-service --no-pager | head -n 3
echo ""
echo "To view logs:"
echo "  journalctl -u auth-service -f"
echo "  journalctl -u storage-service -f"
