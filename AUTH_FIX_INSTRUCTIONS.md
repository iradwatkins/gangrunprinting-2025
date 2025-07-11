# Authentication Fix Instructions

## Issue Summary
The application is experiencing authentication issues where user profiles cannot be loaded due to RLS (Row Level Security) policies blocking access.

## Quick Fix Steps

### 1. Run the Migration Script
Execute the following SQL script in your Supabase SQL editor:
```sql
-- Location: supabase/migrations/20250111_fix_user_profiles_rls.sql
```

This script will:
- Fix RLS policies on the user_profiles table
- Create a function to safely get or create profiles
- Ensure all existing users have profiles
- Set up proper indexes for performance

### 2. If You're Stuck on Loading Screen

Open the browser console and run:
```javascript
runAuthDiagnostics()
```

This will help diagnose the specific issue.

### 3. Recovery Options

The app now shows an error recovery screen with these options:

1. **Sign Out & Retry** - Clears auth and lets you sign in again
2. **Clear Session & Reload** - Removes all cached auth data
3. **Continue Without Auth** - Bypasses auth temporarily

### 4. Manual Database Fix (If Needed)

If the migration doesn't work, run this in Supabase SQL editor:

```sql
-- Disable RLS temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Create profile for specific user
INSERT INTO public.user_profiles (
  id, 
  email, 
  role, 
  is_broker, 
  broker_category_discounts
)
SELECT 
  id,
  email,
  'customer',
  false,
  '{}'
FROM auth.users
WHERE id = '70782a82-6051-40f7-9644-32ab58e3ddf9'  -- Replace with your user ID
ON CONFLICT (id) DO NOTHING;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

## What Changed

1. **Added SessionProvider** - Fixed the "useSession must be used within SessionProvider" error
2. **Increased Timeouts** - Changed from 3s to 10s for profile loading
3. **Fixed Column Names** - Changed from `user_id` to `id` in queries
4. **Added RPC Function** - Created `get_or_create_profile` to bypass RLS
5. **Added Error Recovery UI** - Shows helpful options when auth fails
6. **Added Diagnostics** - `runAuthDiagnostics()` function for debugging

## Prevention

To prevent this in the future:
1. Always ensure new users get profiles created automatically
2. Keep RLS policies simple and performant
3. Monitor for profile loading timeouts
4. Test with different user roles