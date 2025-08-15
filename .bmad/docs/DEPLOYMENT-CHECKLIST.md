# 🚀 DEPLOYMENT CHECKLIST - MANDATORY VERIFICATION

**Purpose:** Prevent deployment failures by validating all requirements before deployment
**Usage:** Complete ALL checks before running deployment scripts
**Last Updated:** August 14, 2025

---

## ⚠️ CRITICAL: DO NOT SKIP ANY CHECKS

### 📋 PRE-DEPLOYMENT CHECKLIST

#### 1. LOCAL BUILD VERIFICATION
- [ ] **Build successful**: `npm run build` completes without errors
- [ ] **Standalone configured**: Verify `output: 'standalone'` in next.config.js
- [ ] **Package size check**: Build package < 50MB
  ```bash
  du -sh .next/standalone  # Should be < 100MB
  ```
- [ ] **Static files exist**: Verify `.next/static` directory exists
- [ ] **Environment file ready**: `.env.production` configured correctly

#### 2. LINE ENDING VERIFICATION
- [ ] **Check script line endings**:
  ```bash
  file scripts/*.sh  # Should show "ASCII text" not "CRLF"
  ```
- [ ] **Fix if needed**:
  ```bash
  sed -i '' 's/\r$//' scripts/*.sh
  ```
- [ ] **.gitattributes exists**: Ensures future scripts use LF

#### 3. VPS PREPARATION
- [ ] **Check disk space**:
  ```bash
  ssh root@72.60.28.175 'df -h /'  # Need at least 1GB free
  ```
- [ ] **Verify port availability**:
  ```bash
  ssh root@72.60.28.175 'netstat -tulpn | grep -E "3000|3005"'
  ```
- [ ] **Check existing deployments**:
  ```bash
  ssh root@72.60.28.175 'pm2 list'
  ```
- [ ] **Backup current deployment**:
  ```bash
  ssh root@72.60.28.175 'tar czf /backup/agistaffers-$(date +%Y%m%d).tar.gz /var/www/agistaffers/current'
  ```

#### 4. PACKAGE CREATION VERIFICATION
- [ ] **Required files included**:
  ```bash
  # Check package contents
  tar tzf /tmp/deployment.tar.gz | head -20
  # Must include:
  # - server.js
  # - package.json
  # - .next/
  # - .next/static/
  # - public/
  # - prisma/
  # - .env
  ```
- [ ] **Package size optimal**:
  ```bash
  ls -lh /tmp/deployment.tar.gz  # Should be 25-35MB
  ```

#### 5. DATABASE PREPARATION
- [ ] **Migrations ready**: `npx prisma migrate deploy --dry-run`
- [ ] **Database backup taken**:
  ```bash
  ssh root@72.60.28.175 'pg_dump agistaffers > /backup/db-$(date +%Y%m%d).sql'
  ```

---

### 🔄 DEPLOYMENT EXECUTION CHECKLIST

#### 1. BLUE-GREEN DEPLOYMENT STATUS
- [ ] **Identify current live environment**:
  ```bash
  # Green = port 3000, Blue = port 3005
  ssh root@72.60.28.175 'pm2 list | grep online'
  ```
- [ ] **Confirm deployment target**: Deploy to STANDBY environment only

#### 2. UPLOAD VERIFICATION
- [ ] **Upload successful**: No timeout or connection errors
- [ ] **File integrity check**:
  ```bash
  # Compare local and remote checksums
  md5sum /tmp/deployment.tar.gz
  ssh root@72.60.28.175 'md5sum /tmp/deployment.tar.gz'
  ```

#### 3. EXTRACTION VERIFICATION
- [ ] **Extract without errors**: No permission or space issues
- [ ] **All files present**:
  ```bash
  ssh root@72.60.28.175 'ls -la /var/www/agistaffers/[blue|green]/'
  ```

#### 4. DEPENDENCIES INSTALLATION
- [ ] **npm ci successful**: No package errors
- [ ] **Prisma client generated**: `npx prisma generate` completed
- [ ] **No vulnerabilities**: Check npm audit results

#### 5. APPLICATION STARTUP
- [ ] **PM2 start successful**: Application running
- [ ] **No restart loops**: Check PM2 status after 30 seconds
- [ ] **Logs clean**: No critical errors in logs
  ```bash
  ssh root@72.60.28.175 'pm2 logs --lines 50'
  ```

---

### ✅ POST-DEPLOYMENT VERIFICATION

#### 1. HEALTH CHECKS
- [ ] **Application responds**:
  ```bash
  curl -I http://72.60.28.175:3005  # For Blue
  curl -I http://72.60.28.175:3000  # For Green
  ```
- [ ] **No 500 errors**: Check response codes
- [ ] **Static assets load**: Verify CSS/JS files load
  ```bash
  curl -I http://72.60.28.175:3005/_next/static/css/[hash].css
  ```

#### 2. FUNCTIONALITY TESTS
- [ ] **Homepage loads**: Full HTML with content
- [ ] **API endpoints work**: Test critical APIs
- [ ] **Database connected**: Check data queries work
- [ ] **Authentication works**: Test login flow

#### 3. TRAFFIC SWITCHING
- [ ] **Update Caddy/Nginx**: Point to new environment
- [ ] **Verify routing**: Traffic goes to correct port
- [ ] **SSL certificate valid**: HTTPS works correctly
- [ ] **Old environment stable**: Keep as rollback option

#### 4. MONITORING
- [ ] **Check metrics**: CPU, Memory, Disk usage normal
- [ ] **Error rate acceptable**: < 1% error rate
- [ ] **Response times good**: < 500ms average
- [ ] **No memory leaks**: Memory usage stable

---

### 🔴 ROLLBACK CHECKLIST (IF NEEDED)

#### IMMEDIATE ROLLBACK STEPS
1. [ ] **Switch traffic back**: Update Caddy to previous environment
2. [ ] **Verify old version running**: Check application works
3. [ ] **Stop failed deployment**: `pm2 stop agistaffers-[env]`
4. [ ] **Document failure**: Create problem-solution document
5. [ ] **Notify team**: Alert about rollback

---

### 📊 DEPLOYMENT METRICS TO TRACK

| Metric | Target | Actual |
|--------|--------|--------|
| Package Size | < 50MB | ___MB |
| Upload Time | < 1 min | ___min |
| Build Time | < 3 min | ___min |
| Deployment Time | < 5 min | ___min |
| Downtime | 0 sec | ___sec |
| Error Rate | < 1% | ___% |
| Response Time | < 500ms | ___ms |

---

### 🛠️ TROUBLESHOOTING QUICK REFERENCE

| Problem | Solution | Prevention |
|---------|----------|------------|
| Package too large | Use standalone build | Check size before upload |
| Port occupied | Use different port | Check ports first |
| Missing files | Include .next/static | Verify package contents |
| Script fails | Fix line endings | Use .gitattributes |
| Memory issues | Increase PM2 memory | Monitor usage |
| SSL errors | Update certificates | Auto-renew with Caddy |

---

### 📝 DEPLOYMENT LOG TEMPLATE

```markdown
## Deployment Log - [DATE]

**Environment:** [Blue/Green]
**Version:** [Git commit hash]
**Deployed by:** [Name]
**Start time:** [Time]
**End time:** [Time]
**Duration:** [Minutes]
**Status:** [Success/Failed/Rolled back]

### Issues Encountered:
- None / [List issues]

### Resolution:
- N/A / [List resolutions]

### Notes:
- [Any additional notes]
```

---

### ⚡ QUICK COMMANDS REFERENCE

```bash
# Check everything at once
./scripts/deployment-preflight-check.sh

# Fix common issues
sed -i '' 's/\r$//' scripts/*.sh  # Fix line endings
pm2 delete agistaffers-blue       # Clear stuck process
rm -rf /var/www/agistaffers/blue/* # Clean failed deployment

# Monitor deployment
pm2 logs --lines 100             # Watch logs
pm2 monit                        # Monitor resources
curl -I http://localhost:3005    # Test response
```

---

**Remember:** A successful deployment is a boring deployment. Follow the checklist, every time, no exceptions.

**Contact:** If issues persist, check `.bmad/problem-solutions/` first, then escalate to DevOps team.