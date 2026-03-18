-- ============================================================
-- SECURITY FIX: Remove dangerously permissive RLS policies
-- ============================================================

-- 1. Remove ALL permissive policies from 'competitors' table
DROP POLICY IF EXISTS "Todos podem ver concorrentes" ON competitors;
DROP POLICY IF EXISTS "Todos podem inserir concorrentes" ON competitors;
DROP POLICY IF EXISTS "Todos podem atualizar concorrentes" ON competitors;
DROP POLICY IF EXISTS "Todos podem deletar concorrentes" ON competitors;
DROP POLICY IF EXISTS "Allow public read access to competitors" ON competitors;
DROP POLICY IF EXISTS "Allow public insert to competitors" ON competitors;
DROP POLICY IF EXISTS "Allow public update to competitors" ON competitors;
DROP POLICY IF EXISTS "Allow public delete from competitors" ON competitors;

-- 2. Create SECURE policies for 'competitors' table
-- Only authenticated users can view competitors
CREATE POLICY "Authenticated users can view competitors" 
ON competitors 
FOR SELECT 
TO authenticated 
USING (true);

-- Only authenticated users can insert competitors
CREATE POLICY "Authenticated users can insert competitors" 
ON competitors 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Only authenticated users can update competitors
CREATE POLICY "Authenticated users can update competitors" 
ON competitors 
FOR UPDATE 
TO authenticated 
USING (true);

-- Only authenticated users can delete competitors
CREATE POLICY "Authenticated users can delete competitors" 
ON competitors 
FOR DELETE 
TO authenticated 
USING (true);

-- 3. Remove overly permissive policy from analysis_activity_log
DROP POLICY IF EXISTS "Service role can manage activity logs" ON analysis_activity_log;

-- 4. Ensure analysis_activity_log has proper user-scoped policies
-- Check if policies already exist before creating
DO $$
BEGIN
  -- Only create if doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_activity_log' 
    AND policyname = 'Users can view their own activity logs'
  ) THEN
    CREATE POLICY "Users can view their own activity logs"
    ON analysis_activity_log
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_activity_log' 
    AND policyname = 'Users can insert their own activity logs'
  ) THEN
    CREATE POLICY "Users can insert their own activity logs"
    ON analysis_activity_log
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;