# 🚫 ANTI-DUPLICATION PROTOCOL - MANDATORY BEFORE ANY CODE CREATION

**Created:** August 14, 2025  
**Status:** ENFORCED  
**Severity:** CRITICAL

---

## ⛔ THE GOLDEN RULE

**"NEVER CREATE WHAT ALREADY EXISTS"**

---

## 🔍 THE MANDATORY 4-STEP PROCESS

### STEP 1: SEARCH FIRST (NO EXCEPTIONS)
```bash
# MUST RUN THESE SEARCHES:
grep -r "ComponentName" . --exclude-dir=node_modules
find . -name "*component*" -type f
ls -la .archives/
ls -la app/
ls -la components/
```

### STEP 2: DECISION TREE
```
CODE FOUND?
    ├─ YES → Go to STEP 3 (Fix/Upgrade)
    └─ NO → Create new (but document search)
```

### STEP 3: FIX EXISTING CODE
```
CAN IT BE FIXED?
    ├─ YES → Fix and enhance it
    └─ NO → Go to STEP 4 (Discuss rebuild)
```

### STEP 4: REBUILD DISCUSSION
```
GET USER APPROVAL?
    ├─ YES → Archive old, create new
    └─ NO → Must use existing code as-is
```

---

## 📋 SEARCH CHECKLIST

**BEFORE creating ANY new file:**

- [ ] Searched file names with `find`
- [ ] Searched content with `grep`
- [ ] Checked `.archives/` folder
- [ ] Checked `app/` directory structure
- [ ] Checked `components/` directory
- [ ] Used `ls` to explore directories
- [ ] Documented what was searched

---

## 🔴 VIOLATION EXAMPLES

### ❌ WRONG WAY:
```
User: "Create admin dashboard"
Claude: *immediately starts creating files*
```

### ✅ RIGHT WAY:
```
User: "Create admin dashboard"
Claude: Let me first search for existing admin dashboard code...
[Searches app/admin/]
Found existing admin pages at app/admin/dashboard/
Let me check if they need fixes...
```

---

## 📊 COMMON DUPLICATES TO AVOID

### Already Exist - DO NOT RECREATE:
- `/app/login/page.tsx` - Login page exists
- `/app/admin/dashboard/page.tsx` - Admin dashboard exists
- `/app/dashboard/` - Customer dashboard (9 pages)
- `/components/dashboard/CustomerSidebar.tsx` - Sidebar exists
- `/auth.ts` - Auth configuration exists
- `/middleware.ts` - Middleware exists

### Check Archives First:
- `.archives/` - Contains old code that might be useful
- Recovered components may exist there

---

## 🎯 SEARCH COMMANDS REFERENCE

### Find Files:
```bash
# Find all dashboard-related files
find . -name "*dashboard*" -type f 2>/dev/null

# Find all admin files
find ./app -name "*admin*" -type f

# Find components
find ./components -name "*.tsx" -type f
```

### Search Content:
```bash
# Search for function/component
grep -r "function Dashboard" . --include="*.tsx"

# Search for specific imports
grep -r "from '@/components" . --include="*.tsx"

# Search for API routes
grep -r "export async function GET\|POST\|PUT" ./app/api
```

### Check Structure:
```bash
# See app structure
ls -la app/

# See what's in archives
ls -la .archives/

# Check components
ls -la components/
```

---

## 📝 DOCUMENTATION TEMPLATE

**Use this for EVERY code creation:**

```markdown
## Code Creation Request: [Feature Name]

### Search Performed:
- Searched for: [what terms/patterns]
- Commands used: [exact commands]
- Locations checked: [directories searched]

### Results:
- Found: [list any similar code found]
- Not found: [confirm what doesn't exist]

### Decision:
- [ ] Creating new (nothing similar exists)
- [ ] Fixing existing (found at: [location])
- [ ] Need rebuild approval (because: [reason])

### Action Taken:
[Describe what was done]
```

---

## ⚠️ CONSEQUENCES OF VIOLATIONS

1. **Immediate:** Stop work, remove duplicate
2. **Document:** Record violation in problem-solutions
3. **Fix:** Find and use the original code
4. **Review:** Check why search was skipped

---

## 💡 REMEMBER

**Time searching = Time saved from:**
- Creating duplicates
- Maintaining multiple versions
- Confusing future developers
- Breaking existing functionality

**ALWAYS SEARCH FIRST - NO EXCEPTIONS!**