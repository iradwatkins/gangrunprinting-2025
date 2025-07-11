# Admin Access Fix Summary

## IMPORTANT: Database Structure
The `user_profiles` table has:
- `id` - A separate UUID (primary key)
- `user_id` - References auth.users(id)
- NOT using `id` as the auth user ID

## What Was Fixed

### 1. Immediate SQL Fix (PRIORITY)
**File:** `supabase/fix-admin-access-immediate.sql`

Run this SQL script in your Supabase SQL editor to immediately grant admin access:
```bash
# This script will:
- Find your user ID from auth.users
- Update your profile using user_id column to have role = 'admin'
- Verify the update was successful
```

### 2. Code Fixes Applied

#### useSession.tsx
- Fixed profile creation to check for admin email
- Now sets `role: 'admin'` for iradwatkins@gmail.com when creating new profiles

#### auth.ts
- Fixed query to use `id` instead of `user_id` (matching actual database schema)

#### SQL Migration
- Updated get_or_create_profile function to set admin role for your email

### 3. New Utilities Added

#### checkAdminStatus()
A utility function available in the browser console:
```javascript
// Run this in browser console to check admin status
await checkAdminStatus()
```

## How to Apply the Fix

### Option 1: Quick Fix (Recommended)
1. Go to Supabase SQL editor
2. Copy and paste the contents of `supabase/fix-admin-access-immediate.sql`
3. Run the script
4. Refresh your application
5. You should now have admin access!

### Option 2: Debug First
1. Open browser console
2. Run: `await checkAdminStatus()` to see current status
3. Run: `await runAuthDiagnostics()` for detailed info
4. Apply the SQL fix above

## What Happens Next

After running the SQL fix:
1. Your profile will have `role: 'admin'`
2. The admin menu should appear in the user menu
3. You can access `/admin` routes
4. The AdminLayout component will recognize you as admin

## Prevention

The code has been updated so that:
- New profiles for iradwatkins@gmail.com will automatically get admin role
- All queries now use the correct `id` column
- Multiple fallback checks ensure admin access is maintained

## Troubleshooting

If you still don't have admin access after the SQL fix:
1. Clear your browser's local storage
2. Sign out and sign back in
3. Check console for any errors
4. Run `await checkAdminStatus()` to verify