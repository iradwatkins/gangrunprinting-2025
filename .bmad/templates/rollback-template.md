# Emergency Rollback Template

## Rollback Trigger Checklist
- [ ] Error rate > 2%
- [ ] Response time > 3 seconds
- [ ] Container health check failed
- [ ] Database connection lost
- [ ] Critical service down

## Rollback Procedure

### 1. Immediate Actions (< 30 seconds)
```bash
# Switch to previous version
docker update --restart=no admin-dashboard-green
docker start admin-dashboard-blue

# Update nginx routing
sed -i 's/admin_green/admin_blue/g' /etc/nginx/sites-enabled/admin
nginx -s reload
```

### 2. Verify Rollback (< 1 minute)
```bash
# Check service health
curl -s https://admin.agistaffers.com/health | jq .

# Verify metrics API
curl -s https://admin.agistaffers.com/api/metrics | jq .

# Check container status
docker ps | grep admin-dashboard
```

### 3. Database Rollback (if needed)
```bash
# Restore from latest backup
./restore-backup.sh -t postgres -d $(date +%Y%m%d)
```

### 4. Post-Rollback Actions
- [ ] Notify team of rollback
- [ ] Document issue that triggered rollback
- [ ] Create incident report
- [ ] Plan fix for next deployment

## Rollback Metrics
- Target rollback time: < 2 minutes
- Data loss tolerance: 0
- Service availability: 99.9%