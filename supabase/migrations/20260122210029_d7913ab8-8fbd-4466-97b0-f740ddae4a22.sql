-- Adicionar apenas as políticas que faltam para user_roles

-- Super Admin pode atualizar roles de outros usuários
CREATE POLICY "Super admin can update user roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Super Admin pode deletar roles de outros usuários
CREATE POLICY "Super admin can delete user roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.is_super_admin(auth.uid()));