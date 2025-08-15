# Payment Workflow Documentation - Dominican Republic Focus

**Created:** August 14, 2025
**Status:** Implementation Complete

## Overview
Dominican Republic customers have a unique payment workflow due to banking limitations. They can ONLY use:
1. **PayPal** (instant processing)
2. **Bank Deposits** (manual verification required)

US customers use Stripe, Square, PayPal, or Cash App - all instant processing.

---

## 🇩🇴 Dominican Republic Bank Deposit Workflow

### Customer Journey:
1. **Customer creates order** → Selects bank deposit as payment method
2. **Customer makes bank deposit** → Goes to their bank, deposits money
3. **Customer uploads receipt** → Returns to site, uploads proof of payment
4. **Status: PENDING** → Order waiting for company verification
5. **Company verifies** → Admin checks bank account, confirms payment
6. **Status: VERIFIED/PAID** → Order activated, customer can use service
7. **Customer notified** → Email confirmation sent

### Status Flow:
```
Order Created → Pending Payment → Processing (receipt uploaded) → Verified (company confirmed) → Active Service
```

---

## Admin Verification Process

### What Admin Sees:
1. **Dashboard Alert:** "3 pending bank deposits require verification"
2. **Deposit Details:**
   - Customer name and email
   - Amount deposited
   - Bank used
   - Transaction reference number
   - Receipt image/PDF
   - Time waiting

### Admin Actions:
1. **Review Receipt** - Click to view uploaded receipt
2. **Check Bank Account** - Login to company bank account
3. **Verify Match** - Confirm amount and reference number
4. **Click "Confirm Payment & Activate"** - This will:
   - Mark payment as VERIFIED
   - Mark order as PAID
   - Activate customer's service
   - Send confirmation email

### If Payment Not Found:
1. **Click "Reject"**
2. **Provide reason** (required)
3. Customer notified with reason
4. Customer can submit new receipt

---

## Database Structure

### Order Statuses:
- **paymentStatus:** `pending` → `processing` → `paid` / `failed`
- **orderStatus:** `pending` → `confirmed` → `active` / `cancelled`

### Bank Deposit Statuses:
- **pending:** Receipt uploaded, waiting for verification
- **processing:** Admin reviewing (optional status)
- **verified:** Payment confirmed, order activated
- **rejected:** Payment not found, customer must retry

---

## Test Customers

### 🇺🇸 US Customers (Instant Payment):
- **John Smith** - john.smith@example.com
- **Sarah Johnson** - sarah.johnson@example.com  
- **Mike Wilson** - mike.wilson@example.com
- Payment Methods: Stripe, Square, PayPal, Cash App

### 🇩🇴 Dominican Republic Customers (Manual Verification):
- **Maria Rodriguez** - maria.rodriguez@example.do
- **Carlos Perez** - carlos.perez@example.do
- **Ana Martinez** - ana.martinez@example.do
- Payment Methods: PayPal, Bank Deposit only

---

## Bank Information for DR Customers

### Available Banks:
1. **Banco Popular Dominicano**
   - Account: 791-234567-8
   - Name: AGI Staffers SRL
   - SWIFT: BPDOSDSD

2. **Banco BHD León**
   - Account: 123-4567890-1
   - Name: AGI Staffers SRL
   - SWIFT: BHDLSDSD

3. **Scotiabank República Dominicana**
   - Account: 987-654321-0
   - Name: AGI Staffers SRL
   - SWIFT: SCRLSDSD

**Important:** Customer must include their order number in the transaction reference.

---

## Key Features

### For DR Customers:
- ✅ Clear instructions in Spanish (if needed)
- ✅ Multiple bank options
- ✅ Receipt upload with preview
- ✅ Status tracking
- ✅ Email notifications at each step
- ✅ 24-48 hour verification promise

### For Admins:
- ✅ Centralized verification dashboard
- ✅ Receipt viewer
- ✅ One-click verification
- ✅ Rejection with reasons
- ✅ Pending count alerts
- ✅ Test data for demos

---

## API Endpoints

### Customer Endpoints:
- `POST /api/payment/bank-deposit` - Submit deposit with receipt
- `GET /api/payment/bank-deposit` - Check deposit status

### Admin Endpoints:
- `GET /api/admin/bank-deposits` - List all pending deposits
- `POST /api/admin/bank-deposits/[id]/verify` - Verify or reject deposit

---

## Security Considerations
- Receipts stored securely (production: use S3/Cloudinary)
- Only last 4 digits of account numbers shown
- Admin authentication required for verification
- Audit trail of all verifications
- Encrypted payment data storage

---

## Testing Instructions

### Test DR Customer Flow:
1. Set header: `X-Test-User-Id: [DR-customer-id]`
2. Visit `/dashboard/payment-methods`
3. Only PayPal and Bank Deposit options shown
4. Select Bank Deposit
5. Follow deposit instructions
6. Upload test receipt
7. Check status shows "Pending"

### Test Admin Verification:
1. Visit `/admin/payments/bank-deposits`
2. See pending deposits from DR customers
3. Click eye icon to view receipt
4. Click green check to verify
5. Confirm in dialog
6. See status change to "Verified"

---

## Future Enhancements
- [ ] SMS notifications for DR customers
- [ ] WhatsApp integration for receipts
- [ ] Automatic OCR for receipt verification
- [ ] Multi-language support (Spanish)
- [ ] Bank API integration for auto-verification
- [ ] Mobile app for receipt upload