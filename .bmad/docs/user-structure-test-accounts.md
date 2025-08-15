# 🎯 USER STRUCTURE & TEST ACCOUNTS

**Created:** August 14, 2025
**Purpose:** Clear testing structure with no confusion

---

## ✅ READY TO TEST - THREE DISTINCT ACCOUNTS

### 1️⃣ ADMIN - Platform Owner (Ira)
```
Email: admin@agistaffers.com
Password: admin123
Role: Platform Owner
Access: /admin (sees EVERYTHING)
Purpose: Manage all clients, websites, system
```

### 2️⃣ CLIENT - Business Owner
```
Email: client@test.com
Password: admin123
Role: Business Client
Access: /dashboard (sees ONLY their data)
Has: 3 test websites assigned
Purpose: Manage their websites, billing, support
```

### 3️⃣ CUSTOMER - Public Visitor
```
Email: None (public)
Password: None
Role: End user
Access: Public pages only
Purpose: Browse websites, make purchases
```

---

## 📝 HOW TO TEST EACH ROLE

### Testing as ADMIN (Ira):
1. Logout if needed
2. Go to http://localhost:3000/login
3. Click "Sign in with password (Admin)"
4. Email: **admin@agistaffers.com**
5. Password: **admin123**
6. You'll see the platform management view

### Testing as CLIENT:
1. Logout if needed
2. Go to http://localhost:3000/login
3. Click "Sign in with password (Admin)"
4. Email: **client@test.com**
5. Password: **admin123**
6. You'll see customer dashboard with 3 websites

### Testing as CUSTOMER:
1. Logout completely
2. Browse public pages without logging in
3. This is what visitors see

---

## 🎯 COMMUNICATION PROTOCOL

When I need you to test something, I'll say:

- **"Ira, as ADMIN..."** = Login with admin@agistaffers.com
- **"Ira, as CLIENT..."** = Login with client@test.com
- **"Ira, as CUSTOMER..."** = Browse without login

---

## ✅ WHAT'S SET UP

- **ADMIN account:** Has full platform access
- **CLIENT account:** Has 3 test websites:
  - Tech Startup Landing
  - Acme Store
  - Small Business Site
- **Both use:** Same password (admin123)
- **Clear separation:** Each sees only appropriate data

---

## 🧪 TEST CHECKLIST

### As ADMIN:
- [ ] Login with admin@agistaffers.com
- [ ] Navigate to /admin
- [ ] See all customers
- [ ] See all websites
- [ ] Manage platform settings

### As CLIENT:
- [ ] Login with client@test.com
- [ ] See dashboard at /dashboard
- [ ] See ONLY their 3 websites
- [ ] Cannot see other customers' data
- [ ] Can manage their websites

### As CUSTOMER:
- [ ] Browse without login
- [ ] See public pages
- [ ] Cannot access dashboard
- [ ] Cannot access admin

---

*This structure ensures clear testing with no confusion about perspectives*