# Blue-Green Deployment Workflow

**Created:** August 14, 2025, 8:45 PM CST
**Status:** Active Implementation
**Type:** Zero-Downtime Deployment Strategy

## Overview
Mandatory blue-green deployment workflow for AGI Staffers platform ensuring zero-downtime deployments with instant rollback capability.

## Deployment Architecture

```
LOCAL (Development) 
    ↓
Deploy to STANDBY (Blue or Green)
    ↓
Test on STANDBY
    ↓
Switch STANDBY → LIVE
    ↓
Old LIVE becomes next STANDBY
```

## Environment Configuration

### Production Servers
- **Blue Environment:** `148.230.93.174:3000`
- **Green Environment:** `148.230.93.174:3001`
- **Load Balancer:** Nginx on port 80/443

### Environment Variables
```bash
# Blue Environment
BLUE_PORT=3000
BLUE_ENV_FILE=.env.blue
BLUE_PM2_NAME=agistaffers-blue

# Green Environment  
GREEN_PORT=3001
GREEN_ENV_FILE=.env.green
GREEN_PM2_NAME=agistaffers-green
```

## Deployment Process

### Step 1: Identify Current LIVE
```bash
# Check which environment is live
curl -s http://agistaffers.com/api/health | grep environment
# Returns: {"environment": "blue"} or {"environment": "green"}
```

### Step 2: Deploy to STANDBY
```bash
# If BLUE is live, deploy to GREEN
./scripts/blue-green-deploy.sh green

# If GREEN is live, deploy to BLUE
./scripts/blue-green-deploy.sh blue
```

### Step 3: Test STANDBY
```bash
# Test blue environment
curl http://148.230.93.174:3000/api/health

# Test green environment
curl http://148.230.93.174:3001/api/health
```

### Step 4: Switch Traffic
```bash
# Switch nginx to new environment
./scripts/switch-environment.sh

# Verify switch
curl http://agistaffers.com/api/health
```

### Step 5: Monitor
```bash
# Watch logs
pm2 logs agistaffers-[blue|green]

# Check metrics
curl http://agistaffers.com/api/metrics
```

## Deployment Scripts

### blue-green-deploy.sh
**Location:** `/agistaffers/scripts/blue-green-deploy.sh`
**Purpose:** Automated deployment to specified environment
**Usage:** `./blue-green-deploy.sh [blue|green]`

### Features:
- Git pull latest code
- Install dependencies
- Build Next.js application
- Run database migrations
- Start with PM2
- Health check validation

### switch-environment.sh
**Location:** `/agistaffers/scripts/switch-environment.sh`
**Purpose:** Switch nginx proxy between environments
**Usage:** `./switch-environment.sh`

### rollback.sh
**Location:** `/agistaffers/scripts/rollback.sh`
**Purpose:** Emergency rollback to previous environment
**Usage:** `./rollback.sh`

## Nginx Configuration

### Blue-Green Proxy
```nginx
upstream agistaffers_live {
    server 127.0.0.1:3000;  # Blue by default
}

server {
    listen 80;
    server_name agistaffers.com admin.agistaffers.com;
    
    location / {
        proxy_pass http://agistaffers_live;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## PM2 Process Management

### Process Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'agistaffers-blue',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      cwd: '/var/www/agistaffers-blue'
    },
    {
      name: 'agistaffers-green',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      },
      cwd: '/var/www/agistaffers-green'
    }
  ]
}
```

### PM2 Commands
```bash
# Start environment
pm2 start ecosystem.config.js --only agistaffers-blue

# Restart environment
pm2 restart agistaffers-blue

# View logs
pm2 logs agistaffers-blue

# Monitor
pm2 monit
```

## Health Checks

### API Health Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    environment: process.env.DEPLOYMENT_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION
  })
}
```

### Automated Health Checks
```bash
#!/bin/bash
# health-check.sh
HEALTH_URL="$1/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
  echo "✅ Health check passed"
  exit 0
else
  echo "❌ Health check failed with status $RESPONSE"
  exit 1
fi
```

## Rollback Procedure

### Automatic Rollback
If health checks fail after deployment:
1. System automatically switches back to previous LIVE
2. Alerts sent to admin team
3. Failed deployment logged for review

### Manual Rollback
```bash
# Quick rollback
./scripts/rollback.sh

# Or manually switch nginx
sudo nginx -s reload
```

## Monitoring & Alerts

### Key Metrics
- Response time
- Error rate
- CPU/Memory usage
- Active connections
- Database pool status

### Alert Thresholds
- Response time > 2s
- Error rate > 1%
- CPU usage > 80%
- Memory usage > 90%

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Blue-Green Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Standby
        run: |
          ssh user@server "./blue-green-deploy.sh"
      - name: Health Check
        run: |
          ./scripts/health-check.sh
      - name: Switch Traffic
        run: |
          ssh user@server "./switch-environment.sh"
```

## Best Practices

### Do's
- ✅ Always deploy to STANDBY first
- ✅ Run comprehensive tests on STANDBY
- ✅ Monitor metrics after switch
- ✅ Keep both environments in sync
- ✅ Document deployment in changelog

### Don'ts
- ❌ Never deploy directly to LIVE
- ❌ Don't skip health checks
- ❌ Avoid manual configuration changes
- ❌ Don't delete old environment immediately
- ❌ Never bypass the blue-green process

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**2. PM2 Not Starting**
```bash
# Clear PM2
pm2 delete all
pm2 kill
# Restart
pm2 start ecosystem.config.js
```

**3. Nginx Not Switching**
```bash
# Check nginx config
nginx -t
# Reload nginx
sudo systemctl reload nginx
```

**4. Database Migration Failed**
```bash
# Rollback migration
npx prisma migrate reset
# Re-run migrations
npx prisma migrate deploy
```

## Related Documentation
- [Customer Dashboard Implementation](./customer-dashboard-implementation.md)
- [System Architecture](./system-architecture.md)
- [Infrastructure Setup](./infrastructure-setup.md)