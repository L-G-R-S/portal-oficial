-- 1. Corrigir roles dos usuários existentes
-- Primeiro, deletar roles existentes para evitar duplicatas
DELETE FROM public.user_roles;

-- Atribuir super_admin ao luguilherme07@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users
WHERE email = 'luguilherme07@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Atribuir 'user' a todos os outros usuários
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'user'::app_role
FROM auth.users
WHERE email != 'luguilherme07@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Atualizar o trigger para reconhecer o super admin específico
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Email específico do super_admin
  IF NEW.email = 'luguilherme07@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    -- Todos os outros usuários são 'user' comum
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Atualizar políticas RLS da primary_company para todos verem
-- Primeiro remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own primary company" ON public.primary_company;
DROP POLICY IF EXISTS "Users can insert their own primary company" ON public.primary_company;
DROP POLICY IF EXISTS "Users can update their own primary company" ON public.primary_company;
DROP POLICY IF EXISTS "Users can delete their own primary company" ON public.primary_company;

-- Criar nova política: todos autenticados podem VER
CREATE POLICY "All authenticated users can view primary company"
ON public.primary_company
FOR SELECT
TO authenticated
USING (true);

-- Apenas super_admin pode INSERT
CREATE POLICY "Only super admin can insert primary company"
ON public.primary_company
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));

-- Apenas super_admin pode UPDATE
CREATE POLICY "Only super admin can update primary company"
ON public.primary_company
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Apenas super_admin pode DELETE
CREATE POLICY "Only super admin can delete primary company"
ON public.primary_company
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- 4. Atualizar políticas das tabelas relacionadas à primary_company
-- primary_company_glassdoor
DROP POLICY IF EXISTS "Users can manage their primary company glassdoor" ON public.primary_company_glassdoor;

CREATE POLICY "All authenticated can view primary company glassdoor"
ON public.primary_company_glassdoor
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admin can manage primary company glassdoor"
ON public.primary_company_glassdoor
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- primary_company_leadership
DROP POLICY IF EXISTS "Users can manage their primary company leadership" ON public.primary_company_leadership;

CREATE POLICY "All authenticated can view primary company leadership"
ON public.primary_company_leadership
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admin can manage primary company leadership"
ON public.primary_company_leadership
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- primary_company_linkedin_posts
DROP POLICY IF EXISTS "Users can manage their primary company linkedin posts" ON public.primary_company_linkedin_posts;

CREATE POLICY "All authenticated can view primary company linkedin posts"
ON public.primary_company_linkedin_posts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admin can manage primary company linkedin posts"
ON public.primary_company_linkedin_posts
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- primary_company_similar_companies
DROP POLICY IF EXISTS "Users can manage their primary company similar companies" ON public.primary_company_similar_companies;

CREATE POLICY "All authenticated can view primary company similar companies"
ON public.primary_company_similar_companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only super admin can manage primary company similar companies"
ON public.primary_company_similar_companies
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));