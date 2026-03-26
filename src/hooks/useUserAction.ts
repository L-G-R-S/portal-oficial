import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserActionType = 
  | 'login' 
  | 'logout'
  | 'orb_chat'
  | 'nova_analise' 
  | 'download_pdf' 
  | 'novo_concorrente' 
  | 'nova_entidade'
  | 'atualizacao_perfil' 
  | 'upload_foto'
  | 'config_change';

export const useUserAction = () => {
  const { user, profile, isSuperAdmin } = useAuth();

  const trackAction = useCallback(async (actionType: UserActionType, details: string) => {
    // Não rastrear ações de super admins
    if (isSuperAdmin) return;
    
    if (!user || !profile) return;

    try {
      await supabase.from('user_usage_logs').insert({
        user_id: user.id,
        role: profile.role,
        action_type: actionType,
        page_path: details, // Reusing page_path column to store action details for now
      });
    } catch (error) {
      console.error('Error tracking user action:', error);
    }
  }, [user, profile, isSuperAdmin]);

  return { trackAction };
};
