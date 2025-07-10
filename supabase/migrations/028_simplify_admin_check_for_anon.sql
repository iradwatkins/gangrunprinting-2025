-- Simplify admin check to work with anonymous users
-- Anonymous users should have read access to active items

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Anonymous users are never admin
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- For authenticated users, check role in user_profiles
    RETURN get_user_role(auth.uid()) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also ensure paper_stocks and other tables allow public read access to active items
DROP POLICY IF EXISTS "Public can view active paper stocks" ON public.paper_stocks;
CREATE POLICY "Anon can view active paper stocks" ON public.paper_stocks
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active paper stocks" ON public.paper_stocks
    FOR SELECT TO authenticated USING (is_active = true);

-- Apply same pattern to other tables
DROP POLICY IF EXISTS "Public can view active coatings" ON public.coatings;
CREATE POLICY "Anon can view active coatings" ON public.coatings
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active coatings" ON public.coatings
    FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active print sizes" ON public.print_sizes;
CREATE POLICY "Anon can view active print sizes" ON public.print_sizes
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active print sizes" ON public.print_sizes
    FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active turnaround times" ON public.turnaround_times;
CREATE POLICY "Anon can view active turnaround times" ON public.turnaround_times
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active turnaround times" ON public.turnaround_times
    FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active add ons" ON public.add_ons;
CREATE POLICY "Anon can view active add ons" ON public.add_ons
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active add ons" ON public.add_ons
    FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active sides" ON public.sides;
CREATE POLICY "Anon can view active sides" ON public.sides
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active sides" ON public.sides
    FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active quantities" ON public.quantities;
CREATE POLICY "Anon can view active quantities" ON public.quantities
    FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Auth can view active quantities" ON public.quantities
    FOR SELECT TO authenticated USING (is_active = true);