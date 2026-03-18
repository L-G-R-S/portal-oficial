import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailSubscriber {
  id: string;
  email: string;
  name: string | null;
  user_id: string | null;
  is_active: boolean;
  receive_instant_alerts: boolean;
  receive_weekly_digest: boolean;
  entities_filter: {
    competitors: boolean;
    prospects: boolean;
    clients: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  subscriber_id: string | null;
  email_to: string;
  subject: string;
  template_type: string;
  entity_type: string | null;
  entity_name: string | null;
  status: string;
  error_message: string | null;
  sent_at: string;
}

export interface EmailStats {
  totalSubscribers: number;
  activeSubscribers: number;
  emailsSentThisMonth: number;
}

export function useEmailSubscribers() {
  const [subscribers, setSubscribers] = useState<EmailSubscriber[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmailStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    emailsSentThisMonth: 0,
  });

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(item => ({
        ...item,
        entities_filter: item.entities_filter as EmailSubscriber['entities_filter'] || {
          competitors: true,
          prospects: true,
          clients: true,
        },
      }));

      setSubscribers(typedData);

      // Calculate stats
      const total = typedData.length;
      const active = typedData.filter(s => s.is_active).length;

      setStats(prev => ({
        ...prev,
        totalSubscribers: total,
        activeSubscribers: active,
      }));
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      toast.error('Erro ao carregar assinantes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs(data || []);

      // Count emails sent this month
      const { count } = await supabase
        .from('email_logs')
        .select('*', { count: 'exact', head: true })
        .gte('sent_at', startOfMonth.toISOString())
        .eq('status', 'sent');

      setStats(prev => ({
        ...prev,
        emailsSentThisMonth: count || 0,
      }));
    } catch (error: any) {
      console.error('Error fetching logs:', error);
    }
  }, []);

  const addSubscriber = async (data: {
    email: string;
    name?: string;
    receive_instant_alerts?: boolean;
    receive_weekly_digest?: boolean;
    entities_filter?: EmailSubscriber['entities_filter'];
  }) => {
    try {
      const { error } = await supabase.from('email_subscribers').insert({
        email: data.email,
        name: data.name || null,
        receive_instant_alerts: data.receive_instant_alerts ?? true,
        receive_weekly_digest: data.receive_weekly_digest ?? true,
        entities_filter: data.entities_filter || {
          competitors: true,
          prospects: true,
          clients: true,
        },
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('Este email já está cadastrado');
          return false;
        }
        throw error;
      }

      toast.success('Assinante adicionado com sucesso');
      await fetchSubscribers();
      return true;
    } catch (error: any) {
      console.error('Error adding subscriber:', error);
      toast.error('Erro ao adicionar assinante');
      return false;
    }
  };

  const updateSubscriber = async (id: string, updates: Partial<EmailSubscriber>) => {
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast.success('Assinante atualizado');
      await fetchSubscribers();
      return true;
    } catch (error: any) {
      console.error('Error updating subscriber:', error);
      toast.error('Erro ao atualizar assinante');
      return false;
    }
  };

  const removeSubscriber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Assinante removido');
      await fetchSubscribers();
      return true;
    } catch (error: any) {
      console.error('Error removing subscriber:', error);
      toast.error('Erro ao remover assinante');
      return false;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateSubscriber(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchSubscribers();
    fetchLogs();
  }, [fetchSubscribers, fetchLogs]);

  return {
    subscribers,
    logs,
    loading,
    stats,
    fetchSubscribers,
    fetchLogs,
    addSubscriber,
    updateSubscriber,
    removeSubscriber,
    toggleActive,
  };
}
