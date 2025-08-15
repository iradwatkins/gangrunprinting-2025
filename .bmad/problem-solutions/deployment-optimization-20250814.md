# Deployment Optimization Problems & Solutions

**Date:** August 14, 2025
**Time:** 11:15 PM CST
**Author:** BMAD System / Claude Code
**Status:** RESOLVED
**Severity:** CRITICAL
**Category:** Deployment, Infrastructure, Build Optimization

---

## EXECUTIVE SUMMARY

During production deployment of AGI Staffers on August 14, 2025, we encountered 5 critical issues that caused deployment delays and failures. This document provides comprehensive documentation of each problem, root cause analysis, implemented solutions, and prevention strategies to ensure these issues never recur.

---

## PROBLEM 1: Massive Deployment Package (145MB)

### Problem Description
- Deployment packages were 145MB, causing 5-10 minute upload times
- Uploads through Cloudflare were timing out
- SCP transfers were extremely slow

### Root Cause Analysis
- Including entire `.next` directory with 629MB of cache files
- Webpack cache files up to 183MB each
- Development artifacts included in production package
- Not utilizing Next.js standalone build feature

### Solution Implemented
```bash
# Use standalone build instead of full .next directory
cp -r .next/standalone/* "$PACKAGE_DIR/"
cp -r .next/static "$PACKAGE_DIR/.next/"
# Result: 25-30MB package instead of 145MB
```

### Prevention Strategy
- ✅ Always use `output: 'standalone'` in next.config.js
- ✅ Never include `.next/cache` in deployments
- ✅ Check package size before upload: `du -sh package.tar.gz`
- ✅ Set maximum package size alert at 50MB

### Verification
```bash
# Before deployment, always check:
du -sh .next/cache  # Should not be included
du -sh /tmp/deployment_package.tar.gz  # Should be < 50MB
```

---

## PROBLEM 2: Port Conflicts (Port 3001 Occupied)

### Problem Description
- Blue environment failed to start on port 3001
- Error: EADDRINUSE - port already in use
- Docker containers (Flowise) occupying port 3001

### Root Cause Analysis
- No port availability check before deployment
- Hard-coded port assumptions in deployment script
- Docker services not considered in port allocation

### Solution Implemented
```bash
# Changed Blue environment to port 3005
PORT=3005 pm2 start server.js --name agistaffers-blue
# Updated Caddy configuration accordingly
```

### Prevention Strategy
- ✅ Always check port availability: `netstat -tulpn | grep :PORT`
- ✅ Use dynamic port allocation in deployment scripts
- ✅ Maintain port registry: Blue=3005, Green=3000
- ✅ Document all services and their ports

### Port Registry
```
Service              | Port  | Environment
---------------------|-------|-------------
agistaffers-green    | 3000  | Production (Live)
agistaffers-blue     | 3005  | Production (Standby)
flowise              | 3001  | Docker Container
portainer            | 3002  | Docker Container
uptime-kuma          | 3004  | Docker Container
```

---

## PROBLEM 3: Missing .next Build Directory

### Problem Description
- Blue environment failed with "Could not find production build"
- `.next` directory not properly copied to deployment
- Standalone server couldn't find required files

### Root Cause Analysis
- Deployment script didn't copy `.next` folder from standalone build
- Incorrect assumption about standalone build structure
- Missing static files in deployment package

### Solution Implemented
```bash
# Proper standalone deployment structure:
cp -r .next/standalone/* "$PACKAGE_DIR/"
cp -r .next/static "$PACKAGE_DIR/.next/"  # Critical: static files
cp -r public "$PACKAGE_DIR/"               # Public assets
```

### Prevention Strategy
- ✅ Always verify deployment structure before upload
- ✅ Test standalone build locally first
- ✅ Include file existence checks in deployment script
- ✅ Document required file structure

### Required Files Checklist
```
deployment/
├── server.js          # Standalone server
├── package.json       # Dependencies
├── .next/
│   ├── BUILD_ID
│   ├── server/        # Server chunks
│   └── static/        # Static assets (REQUIRED)
├── public/            # Public files
└── .env               # Environment variables
```

---

## PROBLEM 4: Script Line Ending Issues (CRLF)

### Problem Description
- Deployment scripts failed with "bad interpreter: /bin/bash^M"
- Windows CRLF line endings preventing script execution
- Recurring issue across multiple scripts

### Root Cause Analysis
- Git not configured to handle line endings properly
- No .gitattributes file to enforce Unix line endings
- Mixed development environments (Windows/Mac/Linux)

### Solution Implemented
```bash
# Fix line endings
sed -i '' 's/\r$//' scripts/*.sh

# Create .gitattributes
cat > .gitattributes << 'EOF'
*.sh text eol=lf
*.bash text eol=lf
EOF

# Configure git
git config --global core.autocrlf input
git config --global core.eol lf
```

### Prevention Strategy
- ✅ .gitattributes file created and committed
- ✅ Git configured for Unix line endings
- ✅ Pre-commit hook to check line endings
- ✅ Automated fix in all deployment scripts

### Permanent Fix
```bash
# Add to beginning of all scripts:
if [[ $(file "$0") == *"CRLF"* ]]; then
    echo "Fixing line endings..."
    sed -i 's/\r$//' "$0"
    exec "$0" "$@"
fi
```

---

## PROBLEM 5: Static Files Not Included

### Problem Description
- Application couldn't load CSS/JS files
- 404 errors for static assets
- Missing _next/static directory

### Root Cause Analysis
- Standalone build separates static files
- Deployment script didn't copy static directory
- Incorrect understanding of Next.js standalone structure

### Solution Implemented
```bash
# Must copy static files separately
tar czf static.tar.gz -C .next static
scp static.tar.gz root@server:/tmp/
ssh root@server 'cd /app/.next && tar xzf /tmp/static.tar.gz'
```

### Prevention Strategy
- ✅ Always include .next/static in deployments
- ✅ Verify static files after deployment
- ✅ Test full page load, not just HTML
- ✅ Add static file check to deployment script

---

## LESSONS LEARNED

1. **Always use standalone builds** - 85% size reduction
2. **Check port availability** - Never assume ports are free
3. **Verify file structure** - Test deployment locally first
4. **Handle line endings** - Enforce Unix line endings everywhere
5. **Include all required files** - Static assets are critical

---

## AUTOMATED PREVENTION

### Deployment Pre-flight Checklist
```bash
#!/bin/bash
# Add to deployment script

# 1. Check package size
PACKAGE_SIZE=$(du -sh package.tar.gz | cut -f1)
if [[ $PACKAGE_SIZE > "50M" ]]; then
    echo "ERROR: Package too large: $PACKAGE_SIZE"
    exit 1
fi

# 2. Check port availability
PORT_CHECK=$(netstat -tulpn | grep :$DEPLOY_PORT)
if [[ -n "$PORT_CHECK" ]]; then
    echo "ERROR: Port $DEPLOY_PORT is occupied"
    exit 1
fi

# 3. Verify required files
REQUIRED_FILES=("server.js" ".next/static" "public" ".env")
for FILE in "${REQUIRED_FILES[@]}"; do
    if [[ ! -e "$FILE" ]]; then
        echo "ERROR: Missing required file: $FILE"
        exit 1
    fi
done

# 4. Fix line endings
find . -name "*.sh" -exec sed -i 's/\r$//' {} \;
```

---

## MONITORING & ALERTS

1. **Package Size Alert**: Notify if > 50MB
2. **Port Conflict Alert**: Check before deployment
3. **Build Verification**: Ensure all files present
4. **Line Ending Check**: Validate scripts before run
5. **Static File Test**: Verify assets load correctly

---

## RELATED DOCUMENTS

- `.bmad/docs/DEPLOYMENT-CHECKLIST.md`
- `scripts/deploy-optimized.sh`
- `PRODUCTION-DEPLOYMENT-GUIDE.md`
- `.gitattributes`

---

## ACTION ITEMS

- [x] Document all problems and solutions
- [ ] Update deployment scripts with checks
- [ ] Create automated pre-flight validation
- [ ] Add monitoring for deployment issues
- [ ] Train team on new procedures

---

**Last Updated:** August 14, 2025, 11:15 PM CST
**Next Review:** August 21, 2025
**Owner:** DevOps Team / BMAD System