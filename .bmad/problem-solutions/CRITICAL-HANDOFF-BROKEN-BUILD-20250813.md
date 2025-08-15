# 🚨 CRITICAL HANDOFF: BROKEN BUILD RECOVERY
**Date:** August 13, 2025 - 7:20 PM CST  
**Severity:** CRITICAL - Production good, Local broken  
**Context Limit:** Previous session at 190k tokens  

---

## 🔴 PART 1: WHAT HAPPENED

### The Sequence of Events:
1. **Started with working local build** - Both agistaffers.com and admin.agistaffers.com were running
2. **User requested cleanup** - Found 60GB storage usage, many duplicates
3. **Aggressive cleanup performed**:
   - Deleted .next cache (558MB)
   - Archived old directories (596MB in .archives)
   - Reorganized entire folder structure
   - Created /demo/dawn-store with new code
4. **BUILD BROKE** - Static files now return 404, webpack cache corrupted

### Current State:
```
✅ PRODUCTION WORKS: agistaffers.com and admin.agistaffers.com are LIVE and WORKING
❌ LOCALHOST BROKEN: 404 errors on all CSS/JS files
❌ ERRORS: "ENOENT: no such file or directory" in .next/cache/webpack
```

---

## 🔵 PART 2: WHAT WE NEED TO DO

### IMMEDIATE RECOVERY PLAN:

#### Step 1: BACKUP CURRENT STATE
```bash
# DO THIS FIRST - NO EXCEPTIONS
cd /Users/irawatkins/Documents/Cursor\ Setup
cp -r agistaffers agistaffers-broken-$(date +%Y%m%d-%H%M%S)
```

#### Step 2: NUCLEAR CLEAN
```bash
cd agistaffers
rm -rf .next node_modules .turbo .cache
npm cache clean --force
```

#### Step 3: FRESH INSTALL
```bash
npm install
npm run build  # NOT dev - build first
npm run start  # Test in production mode
```

#### Step 4: VERIFY
- Check http://localhost:3000 (main site)
- Check http://localhost:3000/admin (admin site)
- NO 404 errors should appear

#### Step 5: IF STILL BROKEN - PULL FROM PRODUCTION
```bash
# Production is WORKING - use it as source of truth
# Download the deployment from your hosting provider
# Replace local with known-good production code
```

---

## 🟡 PART 3: WHY IT HAPPENED

### Root Causes:
1. **Mixed production/dev files** - Dawn demo added to production app
2. **Aggressive cleanup** - Deleted build caches while server running
3. **No staging test** - Changes made directly to main app
4. **Context overflow** - At 190k tokens, missed critical details

### What Was Lost:
- PROJECT-STRUCTURE-ANALYSIS.md (documented what was duplicate)
- Working webpack cache
- Proper static file references

---

## 📋 ORIGINAL PROJECT REQUIREMENTS (MUST PRESERVE)

### Features Being Built:
1. **CRM System**:
   - Dual CRM (admin + customer)
   - Shipping: FedEx, UPS, Southwest Airlines
   - Dominican Republic custom shipping

2. **Marketing Tools**:
   - Funnel builders
   - A/B testing
   - Abandoned cart recovery
   - Order bumps
   - Sliding cart

3. **White-Label Services**:
   - n8n → "AGI Automation"
   - Flowwise → "AGI Intelligence"

4. **Customer Deployment**:
   - Payment → Container → Website
   - Docker per customer
   - Auto SSL certificates

---

## 🎯 CRITICAL FILES TO CHECK

### Must Exist and Work:
```
/agistaffers/
├── app/
│   ├── page.tsx (main homepage)
│   ├── admin/page.tsx (admin dashboard)
│   └── api/metrics/route.ts
├── prisma/schema.prisma (database)
├── package.json (dependencies)
├── .env.local (credentials - DO NOT LOSE)
└── auth.ts (authentication)
```

### Can Delete:
```
/agistaffers/app/demo/  (dawn-store demo that broke things)
/.archives/ (596MB of old code)
```

---

## ⚠️ WARNINGS FOR NEXT SESSION

1. **DO NOT run cleanup while dev server is running**
2. **DO NOT mix demo code with production app**
3. **DO NOT delete .next while Next.js is running**
4. **ALWAYS backup before major changes**

---

## 🆘 EMERGENCY CONTACTS

- Production site: https://agistaffers.com (WORKING)
- Admin site: https://admin.agistaffers.com (WORKING)
- GitHub Issues: https://github.com/anthropics/claude-code/issues

---

## ✅ SUCCESS CRITERIA

You've fixed it when:
1. `npm run dev` works without errors
2. http://localhost:3000 loads with NO 404s
3. http://localhost:3000/admin shows dashboard
4. All static files load (check Network tab)
5. Build completes: `npm run build` succeeds

---

## 🔄 HANDOFF CHECKLIST

When starting new session:
1. [ ] Read this document completely
2. [ ] Check production sites are still working
3. [ ] Backup current state before any changes
4. [ ] Follow recovery plan exactly
5. [ ] Test thoroughly before declaring fixed
6. [ ] Document what actually fixed it

---

## 📝 BMAD STORY REFERENCE

This work relates to:
- Story: ENT-004-client-website-templates
- Location: .bmad/stories/2-in-progress/
- Status: Was working, now broken, needs recovery

**CRITICAL: The production code is GOOD. Use it as source of truth!**

---

END OF HANDOFF - Good luck! You're inheriting a broken build but production is solid.