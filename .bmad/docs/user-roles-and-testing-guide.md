# 🎭 USER ROLES & TESTING GUIDE - AGI STAFFERS

**Date:** August 14, 2025
**Purpose:** Clear distinction between user types and what to test for each

---

## 👥 THREE USER TYPES IN YOUR PLATFORM

### 1️⃣ **VISITOR** (Pre-Customer/End User)
**Who:** General public visiting agistaffers.com
**Access:** Public pages only
**What They See:**
- Homepage (/)
- Pricing pages
- Website templates catalog
- About Us
- Contact form
- Sign up / Login buttons
**Goal:** Convert them into customers

### 2️⃣ **CUSTOMER** (Your Clients)
**Who:** Businesses who purchased websites from you
**Access:** Customer Dashboard (/dashboard)
**What They See:**
- Their purchased websites only
- Their billing/invoices
- Their support tickets
- Their analytics
- Payment methods
- Profile settings
**Examples from Database:**
- Tech Innovations USA
- Johnson Marketing Group
- Rodriguez Consulting SRL

### 3️⃣ **ADMIN** (You and Your Team)
**Who:** AGI Staffers staff managing the platform
**Access:** Admin Panel (/admin) + Everything
**What They See:**
- ALL customers
- ALL websites
- ALL billing records
- Platform statistics
- User management
- System settings
- Deployment controls
**Current Login:** admin@agistaffers.com

---

## 🧪 CURRENT TESTING STATUS

### ✅ What You're Testing RIGHT NOW:
- **URL:** http://localhost:3000/dashboard
- **Logged in as:** ADMIN (admin@agistaffers.com)
- **Viewing:** CUSTOMER DASHBOARD (but with admin privileges)
- **Purpose:** Testing what YOUR CLIENTS would see

### 🎯 Testing Checklist by User Type

---

## 📋 VISITOR TESTING (Not Logged In)
**First, LOGOUT and test these:**

- [ ] Homepage (/) - Landing page with services
- [ ] `/login` - Login options (Google, Magic Link, Password)
- [ ] `/pricing` - Service packages
- [ ] `/templates` - Website template showcase
- [ ] `/contact` - Contact form
- [ ] Mobile responsiveness
- [ ] Call-to-action buttons
- [ ] Sign up flow

**Status:** ⚠️ These pages may need to be created

---

## 📋 CUSTOMER TESTING (Client Dashboard)
**Currently testing at /dashboard:**

- [x] Login works (using admin account)
- [ ] `/dashboard` - Main dashboard
- [ ] `/dashboard/websites` - Shows ONLY their websites
- [ ] `/dashboard/billing` - Their invoices only
- [ ] `/dashboard/support` - Their tickets only
- [ ] `/dashboard/profile` - Their company info
- [ ] `/dashboard/settings` - Their preferences
- [ ] `/dashboard/analytics` - Their site metrics
- [ ] `/dashboard/reports` - Their reports
- [ ] `/dashboard/help` - Help documentation

**Key Test:** Customer should ONLY see their own data, not other customers'

---

## 📋 ADMIN TESTING (Platform Management)
**Navigate to /admin to test:**

- [ ] `/admin` - Admin dashboard
- [ ] `/admin/customers` - ALL customers list
- [ ] `/admin/websites` - ALL websites across platform
- [ ] `/admin/billing` - ALL invoices and payments
- [ ] `/admin/users` - User management
- [ ] `/admin/settings` - System configuration
- [ ] `/admin/deployments` - Website deployment control
- [ ] `/admin/reports` - Platform-wide analytics
- [ ] `/admin/support` - ALL support tickets

**Key Test:** Admin can see EVERYTHING and manage all aspects

---

## 🔄 HOW TO TEST EACH ROLE

### To Test as VISITOR:
```
1. Click Logout (or clear cookies)
2. Visit http://localhost:3000
3. Browse without logging in
```

### To Test as CUSTOMER:
```
1. Currently: You're in customer dashboard as admin
2. Better: Create a regular customer account
3. Login with customer credentials
4. Verify they see ONLY their data
```

### To Test as ADMIN:
```
1. Stay logged in as admin@agistaffers.com
2. Navigate to http://localhost:3000/admin
3. Test platform management features
```

---

## 🎯 WHAT WE SHOULD BUILD/TEST NEXT

### For VISITORS (Marketing Site):
- [ ] Homepage with services
- [ ] Template showcase
- [ ] Pricing page
- [ ] Sign up flow
- [ ] About/Contact pages

### For CUSTOMERS (Client Portal):
✅ Dashboard pages exist
- [ ] Verify data isolation (customers see only their data)
- [ ] Test ordering new websites
- [ ] Test support ticket creation
- [ ] Test payment methods

### For ADMINS (Management Panel):
- [ ] Build /admin pages
- [ ] Customer management
- [ ] Platform statistics
- [ ] Billing management
- [ ] Support ticket management

---

## 📌 CLEAR COMMUNICATION MOVING FORWARD

When we work, I'll always specify:
- **"VISITOR FEATURE"** - For public/marketing pages
- **"CUSTOMER FEATURE"** - For your clients' dashboard
- **"ADMIN FEATURE"** - For platform management

Example:
- "Let's test the CUSTOMER billing page"
- "Let's build the VISITOR homepage"
- "Let's create the ADMIN customer management"

---

## 🚦 CURRENT STATUS

**You are testing:** CUSTOMER DASHBOARD
**Logged in as:** ADMIN
**This shows:** What your CLIENTS would see
**Next step:** Specify which user type you want to focus on

---

*This guide ensures we always know which user perspective we're building/testing for*