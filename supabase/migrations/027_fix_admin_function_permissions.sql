-- Fix admin function to handle anonymous users properly

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is authenticated first
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Only iradwatkins@gmail.com is admin, or users with admin role
    RETURN (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND email = 'iradwatkins@gmail.com'
        )
        OR 
        get_user_role(auth.uid()) = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the function to access auth.users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_broker() TO authenticated, anon;