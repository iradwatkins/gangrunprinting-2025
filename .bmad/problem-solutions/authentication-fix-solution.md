# Problem: NextAuth Authentication Errors

**Date:** August 14, 2025, 11:45 AM CST
**Status:** INVESTIGATING
**Severity:** CRITICAL
**Agent:** BMAD Orchestrator

## Problem Description
NextAuth showing adapter errors and 401 unauthorized responses despite proper configuration.

### Symptoms
1. `[auth][error] AdapterError` in console
2. `/api/customer-sites` returning 401 Unauthorized
3. Users cannot authenticate with Google OAuth or Magic Links

## Investigation Results

### ✅ Configuration Verified
- NextAuth configuration files exist and properly structured
- Google OAuth credentials present in `.env.local`
- Gmail SMTP credentials configured for Magic Links
- Database connection string correct

### ✅ Infrastructure Verified
- PostgreSQL database running on localhost:5432
- Auth tables exist (users, accounts, sessions, verification_tokens)
- Prisma adapter installed (@auth/prisma-adapter@2.10.0)
- Database schema synchronized with Prisma

### ✅ No Code Duplication Found
- Single auth.ts configuration file
- Single auth.config.ts for callbacks
- Auth actions properly separated in app/actions/auth.ts

## Root Cause Analysis

### Issue 1: Environment Variable Conflict
**Problem:** Multiple .env files with different NEXTAUTH_URL values
- `.env` has production URL: `https://agistaffers.com`
- `.env.local` has localhost URL: `http://localhost:3000`
- Port mismatch: App running on 3001, config expects 3000

### Issue 2: Session Strategy Mismatch
**Problem:** Using JWT strategy but PrismaAdapter expects database sessions
- Current: `session: { strategy: 'jwt' }`
- PrismaAdapter designed for database sessions

## Solution Plan

### Step 1: Fix Environment Variables
```bash
# Update .env.local
NEXTAUTH_URL="http://localhost:3001"  # Match actual port
```

### Step 2: Fix Session Strategy
Choose one approach:
- **Option A:** Use database sessions (recommended for production)
- **Option B:** Remove PrismaAdapter if using JWT

### Step 3: Test Authentication Flow
1. Test Google OAuth login
2. Test Magic Link email
3. Verify session persistence
4. Check API authentication

## MCP Tools Used
- **Bash:** Environment checks, database verification
- **File System:** Configuration file analysis
- **PostgreSQL:** Direct database verification (via psql)

## Files Involved
- `/auth.ts` - Main configuration
- `/auth.config.ts` - Callbacks and routing
- `/.env.local` - Environment variables
- `/app/api/auth/[...nextauth]/route.ts` - API route
- `/middleware.ts` - Auth middleware

## Next Steps
1. Apply environment variable fix
2. Test authentication
3. Document working configuration
4. Update handoff documentation

## Related Stories
- `.bmad/stories/1-active/authentication-fix.md`
- `.bmad/stories/1-active/customer-dashboard-activation.md`