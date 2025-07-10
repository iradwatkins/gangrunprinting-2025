# Fix for Quantity Groups Not Saving

The issue is with the Row Level Security (RLS) policy on the `quantities` table. The current policy uses an outdated admin check.

## Quick Fix

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Drop old policy
DROP POLICY IF EXISTS "Admin can manage quantity groups" ON public.quantities;

-- Create new policy using is_admin field
CREATE POLICY "Admin can manage quantity groups" ON public.quantities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() 
            AND is_admin = true
        )
    );

-- Ensure public read access
DROP POLICY IF EXISTS "Public can view active quantity groups" ON public.quantities;
CREATE POLICY "Public can view active quantity groups" ON public.quantities
    FOR SELECT USING (is_active = true);
```

## Verify Your Admin Status

After applying the fix, make sure your user account has admin privileges:

```sql
-- Check if your user has admin status
SELECT id, email, is_admin 
FROM public.user_profiles 
WHERE id = auth.uid();

-- If is_admin is false, update it:
UPDATE public.user_profiles 
SET is_admin = true 
WHERE id = auth.uid();
```

## Test

1. Refresh the Quantities page at https://gangrunprinting.com/admin/quantities
2. The "Authentication Status Debug" section should show "Admin" badge
3. Try creating a new quantity group - it should now save successfully

The enhanced error messages and diagnostic tools on the page will help identify any remaining issues.