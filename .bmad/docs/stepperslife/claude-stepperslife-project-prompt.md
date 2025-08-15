
# SteppersLife.com AI Agent Project Instructions

## 🎯 PROJECT OVERVIEW
**Domain**: stepperslife.com  
**Status**: LIVE & OPERATIONAL (as of August 5, 2025)  
**Mission**: Community lifestyle platform with events, profiles, and business directory  
**Database**: Successfully migrated with 64 rows of production data  

## 🏗️ INFRASTRUCTURE STACK
**Server**: Hostinger VPS (Ubuntu 24.04) - IP: 148.230.93.174  
**Database**: PostgreSQL 15 (Docker container: `stepperslife-db`)  
**Application**: Next.js + Vite (Docker container: `stepperslife`)  
**Reverse Proxy**: Caddy with auto-SSL (Let's Encrypt)  
**DNS/CDN**: Cloudflare  
**Port Mapping**: 3002→8080 (internal)  

## 💾 DATABASE DETAILS
```bash
# Connection Info
Container: stepperslife-db
Database: stepperslife
User: postgres
Password: SecurePass123 (⚠️ CHANGE IN PRODUCTION)
Port: 5432
URL: postgresql://postgres:SecurePass123@localhost:5432/stepperslife

# Data Summary
- 24 tables created ✅
- 56 events migrated ✅
- 6 user profiles migrated ✅
- 2 community businesses migrated ✅
- Total: 64 rows of production data
```

## 🔧 CRITICAL COMMANDS

### Quick Health Check
```bash
# SSH to server
ssh root@148.230.93.174

# Check all containers
docker ps | grep -E "(stepperslife|postgres)"

# Test app response
curl -I http://localhost:3002

# Test external access
curl -I https://stepperslife.com
```

### Emergency Recovery
```bash
# If database container stops
docker start stepperslife-db

# If app container stops
docker restart stepperslife

# If SSL/Caddy issues
docker restart caddy
docker logs caddy | tail -10

# Connect to database directly
docker exec -it stepperslife-db psql -U postgres -d stepperslife
```

### Backup Commands
```bash
# Create database backup
docker exec stepperslife-db pg_dump -U postgres stepperslife > stepperslife_backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i stepperslife-db psql -U postgres stepperslife < backup_file.sql

# Check data integrity
docker exec -it stepperslife-db psql -U postgres -d stepperslife -c "
SELECT 'events' as table_name, count(*) as rows FROM events
UNION ALL
SELECT 'profiles', count(*) FROM profiles  
UNION ALL
SELECT 'community_businesses', count(*) FROM community_businesses;"
```

## 🚨 KNOWN ISSUES & SOLUTIONS

### Issue: "Connection Refused" on localhost:3002
**Solution**: 
```bash
docker restart stepperslife
docker logs stepperslife | tail -10
```

### Issue: SSL Certificate Problems
**Solution**:
```bash
docker restart caddy
# Check Caddy logs for certificate status
docker logs caddy | grep -E "(certificate|SSL|error)"
```

### Issue: Database Connection Fails
**Solution**:
```bash
# Check if database is running
docker ps | grep postgres
# Test connection
docker exec -it stepperslife-db psql -U postgres -d stepperslife -c "SELECT 1;"
```

## 🔒 SECURITY REMINDERS

### URGENT - Change These Defaults Before Production:
- [ ] Database password: `SecurePass123`
- [ ] Update all environment variables
- [ ] Rotate any default API keys
- [ ] Review user permissions

### Security Best Practices:
- [ ] Regular database backups (weekly minimum)
- [ ] Monitor container logs for errors
- [ ] Keep Docker images updated
- [ ] Monitor SSL certificate renewals

## 📋 SUCCESS CRITERIA CHECKLIST

When working on SteppersLife.com, verify these work:
- [ ] **Database**: 56 events + 6 profiles + 2 businesses visible
- [ ] **External Access**: https://stepperslife.com loads with SSL
- [ ] **Internal Access**: http://localhost:3002 returns HTTP 200
- [ ] **Containers**: Both `stepperslife` and `stepperslife-db` running
- [ ] **DNS**: stepperslife.com resolves correctly
- [ ] **Authentication**: User login/registration functional
- [ ] **Events**: Event listings display correctly
- [ ] **Business Directory**: Community businesses accessible

## 🎯 COMMON TASKS

### Add New Feature
1. SSH to server: `ssh root@148.230.93.174`
2. Navigate to app: `cd /root/stepperslife`
3. Check containers: `docker ps`
4. Make changes and restart: `docker restart stepperslife`

### Database Query/Update
1. Connect to DB: `docker exec -it stepperslife-db psql -U postgres -d stepperslife`
2. Run queries safely with transactions
3. Always backup before major changes

### Troubleshooting Workflow
1. Check container status: `docker ps`
2. Check app logs: `docker logs stepperslife | tail -20`
3. Check database logs: `docker logs stepperslife-db | tail -20`
4. Test internal: `curl -I http://localhost:3002`
5. Test external: `curl -I https://stepperslife.com`

## 📞 EMERGENCY CONTACT INFO
- **Server**: Hostinger VPS Dashboard
- **Domain**: Cloudflare Dashboard  
- **SSL**: Auto-renewing via Caddy/Let's Encrypt
- **Backup Location**: Local server (create backup schedule!)

## 💡 DEVELOPMENT NOTES
- **Framework**: Next.js with Vite preview mode
- **Database ORM**: [Add when known]
- **Authentication**: [Add when implemented]
- **File Storage**: [Add when configured]
- **Environment**: Production data in development setup (be careful!)

---

**🤖 AI AGENT INSTRUCTIONS:**
When the user mentions SteppersLife.com, always reference this document to:
1. Check current status and health
2. Provide accurate connection details
3. Suggest appropriate troubleshooting steps
4. Remind about security best practices
5. Maintain context of the 64 migrated rows of data
6. Keep track of any changes or updates made

**Last Updated**: August 5, 2025  
**Migration Status**: ✅ COMPLETE - All original data successfully migrated