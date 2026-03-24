import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProfileAvatar {
  avatarUrl: string | null;
  isLoading: boolean;
}

export function useProfileAvatar(userId: string | undefined): ProfileAvatar {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadAvatar = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('user_id', userId)
          .maybeSingle();

        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error('Erro ao carregar avatar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvatar();
  }, [userId]);

  useEffect(() => {
    const handler = (e: any) => setAvatarUrl(e.detail as string);
    window.addEventListener('avatar-updated', handler);
    return () => window.removeEventListener('avatar-updated', handler);
  }, []);

  return { avatarUrl, isLoading };
}

export function getInitials(fullName: string | undefined): string {
  if (!fullName) return 'U';
  return fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getRoleLabel(role: string): string {
  const roles = {
    executivo: 'Executivo',
    delivery: 'Delivery',
    coe_sap: 'COE SAP',
    coe_qa: 'COE QA',
    people: 'People',
    financeiro: 'Financeiro',
    inovacao: 'Inovação',
    marketing: 'Marketing',
    comercial: 'Comercial',
  };
  return roles[role as keyof typeof roles] || role;
}
