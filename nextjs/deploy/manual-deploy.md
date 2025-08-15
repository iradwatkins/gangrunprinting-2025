# Manual PostgreSQL Deployment Guide

## Server Details
- **IP**: 72.60.28.175
- **Port**: 3100
- **Password**: Papi2024

## Prerequisites on Server

```bash
# 1. Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose -y

# 2. Create application directory
sudo mkdir -p /opt/gangrunprinting
cd /opt/gangrunprinting
```

## Step-by-Step Deployment

### 1. Prepare Files Locally

```bash
# Build the Next.js application
cd /Users/irawatkins/gangrunprinting-2025/nextjs
npm run build

# Create deployment package
tar -czf deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next/cache' \
  --exclude='*.log' \
  .
```

### 2. Transfer Files to Server

```bash
# Copy deployment package
scp deploy.tar.gz root@72.60.28.175:/opt/gangrunprinting/

# Copy Docker files
scp deploy/docker-compose.yml root@72.60.28.175:/opt/gangrunprinting/
scp deploy/Dockerfile root@72.60.28.175:/opt/gangrunprinting/
scp deploy/.env.production root@72.60.28.175:/opt/gangrunprinting/.env
```

### 3. On the Server

```bash
# SSH into server
ssh root@72.60.28.175
# Password: Papi2024

# Navigate to app directory
cd /opt/gangrunprinting

# Extract deployment
tar -xzf deploy.tar.gz

# Create required directories
mkdir -p uploads
mkdir -p postgres_data

# Set permissions
chmod 755 uploads
```

### 4. Configure Environment

Edit `.env` file on server:
```bash
nano /opt/gangrunprinting/.env
```

Update these values:
```env
DB_PASSWORD=YourSecurePassword123!
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 5. Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 6. Initialize Database

```bash
# Run Prisma migrations
docker-compose exec nextjs npx prisma migrate deploy

# Generate Prisma client
docker-compose exec nextjs npx prisma generate

# (Optional) Seed database with initial data
docker-compose exec nextjs npx prisma db seed
```

### 7. Configure Nginx (Optional)

If you have Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name gangrunprinting.com www.gangrunprinting.com;
    
    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8. SSL Certificate (Optional)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d gangrunprinting.com -d www.gangrunprinting.com
```

## Verification

1. **Check containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Test application:**
   ```bash
   curl http://localhost:3100
   ```

3. **Check database connection:**
   ```bash
   docker-compose exec postgres psql -U gangrun -d gangrunprinting -c "SELECT COUNT(*) FROM users;"
   ```

4. **View logs:**
   ```bash
   docker-compose logs nextjs
   docker-compose logs postgres
   ```

## Troubleshooting

### Container won't start
```bash
docker-compose down
docker-compose up -d --build
```

### Database connection issues
```bash
# Check PostgreSQL is running
docker-compose exec postgres pg_isready

# Check connection from Next.js container
docker-compose exec nextjs sh -c "nc -zv postgres 5432"
```

### Permission issues
```bash
# Fix upload directory permissions
docker-compose exec nextjs chown -R nextjs:nodejs /app/uploads
```

### Reset everything
```bash
docker-compose down -v  # Remove volumes too
rm -rf postgres_data uploads
docker-compose up -d --build
```

## Backup Strategy

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U gangrun gangrunprinting > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U gangrun gangrunprinting < backup_20240101.sql
```

### File Backup
```bash
# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## Monitoring

### Check resource usage
```bash
docker stats
```

### Check application health
```bash
# Create health check endpoint in Next.js
curl http://localhost:3100/api/health
```

## Updates

To deploy updates:
```bash
# 1. Build new version locally
npm run build

# 2. Create new deployment package
tar -czf deploy-update.tar.gz ...

# 3. On server
docker-compose down
# Extract new files
tar -xzf deploy-update.tar.gz
docker-compose up -d --build
docker-compose exec nextjs npx prisma migrate deploy
```

## Important Notes

1. **Always backup before updates**
2. **Test in development first**
3. **Monitor logs after deployment**
4. **Keep .env file secure**
5. **Regularly update Docker images**
6. **Set up automated backups**
7. **Configure firewall rules**

## Support Commands

```bash
# View all logs
docker-compose logs

# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Remove everything (careful!)
docker-compose down -v

# Enter Next.js container
docker-compose exec nextjs sh

# Enter PostgreSQL container
docker-compose exec postgres bash
```