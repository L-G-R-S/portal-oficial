import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface EmailAlertSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  frequency_type: 'instant' | 'daily' | 'weekly' | 'monthly';
  frequency_day: number;
  frequency_hour: number;
  only_high_impact: boolean;
  last_digest_at: string | null;
  next_digest_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileSearchResult {
  user_id: string;
  full_name: string;
  email: string | null;
}

const DEFAULT_SETTINGS: Omit<EmailAlertSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  is_enabled: true,
  frequency_type: 'weekly',
  frequency_day: 1,
  frequency_hour: 9,
  only_high_impact: true,
  last_digest_at: null,
  next_digest_at: null,
};

export function useEmailAlertSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<EmailAlertSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_alert_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as EmailAlertSettings);
      } else {
        // Create default settings
        const { data: newData, error: insertError } = await supabase
          .from('email_alert_settings')
          .insert({ user_id: user.id, ...DEFAULT_SETTINGS })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData as EmailAlertSettings);
      }
    } catch (error: any) {
      console.error('Error loading email alert settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateSettings = async (updates: Partial<EmailAlertSettings>) => {
    if (!settings?.id) return false;

    try {
      const { error } = await supabase
        .from('email_alert_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Configurações atualizadas');
      return true;
    } catch (error: any) {
      console.error('Error updating email alert settings:', error);
      toast.error('Erro ao atualizar configurações');
      return false;
    }
  };

  const searchProfiles = async (query: string): Promise<ProfileSearchResult[]> => {
    if (!query || query.length < 2) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error searching profiles:', error);
      return [];
    }
  };

  const triggerManualSend = async (subscriberIds?: string[]) => {
    try {
      setIsSending(true);

      const { data, error } = await supabase.functions.invoke('send-digest-email', {
        body: { subscriber_ids: subscriberIds, force: true },
      });

      if (error) throw error;

      toast.success(`Envio realizado: ${data?.sent || 0} emails enviados`);
      return true;
    } catch (error: any) {
      console.error('Error triggering manual send:', error);
      toast.error('Erro ao enviar emails');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    isSending,
    updateSettings,
    searchProfiles,
    triggerManualSend,
    refetch: loadSettings,
  };
}
