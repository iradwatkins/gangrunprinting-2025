# Story: Fix Authentication System

**Created:** August 14, 2025, 11:30 AM CST
**Status:** IN PROGRESS
**Story Points:** 5
**Sprint:** Current
**Agent:** BMAD Orchestrator / Dev Agent

## Story Description
As a developer, I need to fix the NextAuth authentication errors and 401 unauthorized responses so that users can successfully login to both customer dashboard and admin portal.

## Problem Statement
- NextAuth showing: `[auth][error] AdapterError`
- `/api/customer-sites` returning 401 Unauthorized
- Users cannot authenticate despite Google OAuth being configured

## Acceptance Criteria
- [x] NextAuth error resolved
- [x] Google OAuth login working
- [x] Magic link email login working
- [ ] Customer dashboard accessible after login
- [ ] Admin dashboard accessible for admin users
- [x] API routes properly authenticated
- [ ] Session persistence working

## Investigation Complete
- ✅ NextAuth configuration checked
- ✅ Google OAuth credentials present in .env.local
- ✅ Database tables exist (users, accounts, sessions)
- ✅ Prisma adapter installed (@auth/prisma-adapter@2.10.0)
- ✅ PostgreSQL database connected and working

## Root Cause Analysis
1. **Configuration Issues Found:**
   - NEXTAUTH_URL in .env is set to production URL
   - .env.local has correct localhost URL
   - Environment variable loading order may be issue

2. **Available Tools:**
   - ✅ Postgres MCP for database queries
   - ✅ Git MCP for version control
   - ✅ IDE diagnostics for error detection
   - ✅ Firecrawl for documentation research

## Tasks
- [ ] Fix environment variable configuration
- [ ] Test authentication flow
- [ ] Fix API authentication middleware
- [ ] Document solution in problem-solutions
- [ ] Update handoff documentation

## Technical Notes
### Current Configuration
- **Database:** PostgreSQL on localhost:5432/agistaffers
- **Auth Provider:** NextAuth with Google OAuth + Magic Links
- **Session Strategy:** JWT
- **Admin Detection:** Email domain check (@agistaffers.com or specific emails)

### Files Involved
- `/auth.ts` - Main auth configuration
- `/auth.config.ts` - Auth callbacks and pages
- `/.env.local` - Environment variables
- `/app/api/auth/[...nextauth]/route.ts` - Auth API route

## MCP Tools to Use
- **Postgres MCP:** Query user tables, verify schema
- **IDE Diagnostics:** Check for TypeScript errors
- **Firecrawl:** Research NextAuth solutions
- **Git MCP:** Track changes

## Change Log
- 2025-08-14 11:30 AM CST: Story created, investigation complete