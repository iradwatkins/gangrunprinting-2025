# Admin Access Fix Instructions

## Quick Fix (Do This First!)

1. **Run the SQL Fix**
   - Go to your Supabase SQL editor
   - Copy and paste ALL contents from: `supabase/fix-admin-direct.sql`
   - Run the entire script
   - You should see "✅ SUCCESS: You are now admin!" at the end

2. **Clear Browser Cache & Reload**
   - Open Chrome DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"
   - OR: Sign out and sign back in

## What Was Done

### 1. Database Fix
The SQL script will:
- Find your auth user ID
- Create or update your profile with admin role
- Show verification that it worked

### 2. Code Bypass (Temporary)
Added special handling for iradwatkins@gmail.com that:
- Bypasses the slow profile loading
- Immediately returns admin profile
- Prevents timeouts

## After Running the Fix

You should see:
- Admin menu in the user dropdown
- Access to /admin routes
- No more profile loading timeouts

## If Still Having Issues

1. Check the console for your user ID:
   ```javascript
   await checkAdminStatus()
   ```

2. Manually verify in SQL:
   ```sql
   SELECT * FROM public.user_profiles 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'iradwatkins@gmail.com');
   ```

3. Force refresh your session:
   - Sign out completely
   - Clear local storage
   - Sign back in

## Important Notes

- The `user_profiles` table uses `user_id` (not `id`) to reference auth users
- Your email has hardcoded admin bypass in the code now
- The SQL fix ensures your database profile has admin role