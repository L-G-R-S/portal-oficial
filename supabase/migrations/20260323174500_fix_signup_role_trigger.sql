-- Atualizar trigger para aceitar a "role" (Função) que vem no payload criador da conta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'), 
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'marketing'::public.user_role),
    NEW.email
  );
  RETURN NEW;
END;
$$;
