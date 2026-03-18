-- Super Admin pode ver todos os perfis
CREATE POLICY "Super admin can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Super Admin pode deletar qualquer perfil
CREATE POLICY "Super admin can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));