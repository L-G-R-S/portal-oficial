import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'super_admin' | 'user';

interface UserRoleData {
  role: AppRole;
  isSuperAdmin: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function useUserRole(userId: string | undefined): UserRoleData {
  const [role, setRole] = useState<AppRole>('user');
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
      } else if (data) {
        setRole(data.role as AppRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  return {
    role,
    isSuperAdmin: role === 'super_admin',
    loading,
    refetch: fetchRole,
  };
}
