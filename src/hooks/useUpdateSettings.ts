import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UpdateSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  frequency_minutes: number;
  last_update_at: string | null;
  next_update_at: string | null;
  update_competitors: boolean;
  update_prospects: boolean;
  update_clients: boolean;
  update_type: 'full' | 'content_news' | 'news_only';
}

interface UpdateLog {
  id: string;
  started_at: string;
  completed_at: string | null;
  total_entities: number;
  entities_updated: number;
  status: string;
  error_message?: string | null;
  current_entity_name?: string | null;
  current_entity_domain?: string | null;
  update_type?: string | null;
  entity_types?: string[] | null;
}

const TIMEOUT_MINUTES = 10;

export function useUpdateSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UpdateSettings | null>(null);
  const [logs, setLogs] = useState<UpdateLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentLog, setCurrentLog] = useState<UpdateLog | null>(null);

  // Check and mark timed-out dispatched updates
  const checkDispatchedTimeout = useCallback(async () => {
    if (!user?.id) return;
    
    const timeoutThreshold = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('update_logs')
      .update({ 
        status: 'timeout', 
        error_message: 'N8N não respondeu em tempo hábil',
        completed_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('status', 'dispatched')
      .lt('started_at', timeoutThreshold);

    if (error) {
      console.error('Error checking timeout:', error);
    }
  }, [user?.id]);

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      // First, check for timed-out updates
      await checkDispatchedTimeout();

      // Try to fetch existing settings
      const { data, error } = await supabase
        .from('update_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as UpdateSettings);
      } else {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('update_settings')
          .insert({
            user_id: user.id,
            is_enabled: false,
            frequency_minutes: 10080, // 7 days
            update_competitors: true,
            update_prospects: true,
            update_clients: true,
            update_type: 'full'
          })
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings as UpdateSettings);
      }

      // Load recent logs
      const { data: logsData } = await supabase
        .from('update_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (logsData) {
        setLogs(logsData as UpdateLog[]);
        // Check if there's an active update (pending, running, or dispatched)
        const activeLog = logsData.find((log: UpdateLog) => 
          log.status === 'running' || log.status === 'pending' || log.status === 'dispatched'
        );
        if (activeLog) {
          setCurrentLog(activeLog as UpdateLog);
          setIsUpdating(true);
        } else {
          setCurrentLog(null);
          setIsUpdating(false);
        }
      }
    } catch (error) {
      console.error('Error loading update settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, checkDispatchedTimeout]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Poll for log updates when updating
  useEffect(() => {
    if (!isUpdating || !currentLog) return;

    const interval = setInterval(async () => {
      // Check for timeout on dispatched updates
      const startedAt = new Date(currentLog.started_at).getTime();
      const now = Date.now();
      const elapsedMinutes = (now - startedAt) / (1000 * 60);

      if (currentLog.status === 'dispatched' && elapsedMinutes >= TIMEOUT_MINUTES) {
        // Mark as timeout
        await supabase
          .from('update_logs')
          .update({ 
            status: 'timeout', 
            error_message: 'N8N não respondeu em tempo hábil',
            completed_at: new Date().toISOString()
          })
          .eq('id', currentLog.id);

        setIsUpdating(false);
        setCurrentLog(null);
        loadSettings();
        toast({
          title: 'Atualização expirada',
          description: 'O servidor não respondeu em tempo hábil. Tente novamente.',
          variant: 'destructive'
        });
        return;
      }

      const { data } = await supabase
        .from('update_logs')
        .select('*')
        .eq('id', currentLog.id)
        .single();

      if (data) {
        setCurrentLog(data as UpdateLog);
        
        // Check for terminal states
        if (data.status === 'completed') {
          setIsUpdating(false);
          setCurrentLog(null);
          loadSettings();
          toast({
            title: 'Atualização concluída',
            description: `${data.entities_updated} entidades atualizadas com sucesso.`
          });
        } else if (data.status === 'failed' || data.status === 'cancelled' || data.status === 'timeout') {
          setIsUpdating(false);
          setCurrentLog(null);
          loadSettings();
          const messages: Record<string, { title: string; description: string }> = {
            cancelled: { title: 'Atualização cancelada', description: 'A atualização foi cancelada.' },
            failed: { title: 'Atualização falhou', description: 'Ocorreu um erro durante a atualização.' },
            timeout: { title: 'Atualização expirada', description: 'O servidor não respondeu em tempo hábil.' }
          };
          const msg = messages[data.status] || messages.failed;
          toast({
            title: msg.title,
            description: msg.description,
            variant: 'destructive'
          });
        }
        // For 'dispatched' and 'running', keep polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isUpdating, currentLog, loadSettings, toast]);

  const updateSettings = async (updates: Partial<UpdateSettings>) => {
    if (!settings?.id) return;

    try {
      // Se está mudando a frequência, recalcular next_update_at
      let finalUpdates = { ...updates };
      
      if (updates.frequency_minutes !== undefined) {
        const baseTime = settings.last_update_at 
          ? new Date(settings.last_update_at) 
          : new Date();
        const nextUpdate = new Date(baseTime.getTime() + updates.frequency_minutes * 60 * 1000);
        finalUpdates.next_update_at = nextUpdate.toISOString();
      }

      const { error } = await supabase
        .from('update_settings')
        .update(finalUpdates)
        .eq('id', settings.id);

      if (error) throw error;

      setSettings(prev => prev ? { ...prev, ...finalUpdates } : null);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de atualização foram atualizadas.'
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      });
    }
  };

  const triggerManualUpdate = async () => {
    if (!user?.id || !settings) return;

    // Check if there's already an active update
    if (isUpdating) {
      toast({
        title: 'Atualização em andamento',
        description: 'Aguarde a atualização atual ser concluída.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUpdating(true);

      // Build entity types array
      const entityTypes: string[] = [];
      if (settings.update_competitors) entityTypes.push('competitor');
      if (settings.update_prospects) entityTypes.push('prospect');
      if (settings.update_clients) entityTypes.push('client');

      if (entityTypes.length === 0) {
        toast({
          title: 'Nenhuma entidade selecionada',
          description: 'Selecione pelo menos um tipo de entidade para atualizar.',
          variant: 'destructive'
        });
        setIsUpdating(false);
        return;
      }

      // Check if there are any entities to update for selected types
      const entityCounts = await checkEntityCounts(entityTypes);
      if (entityCounts.total === 0) {
        const emptyTypes = entityCounts.details
          .filter(d => d.count === 0)
          .map(d => d.label)
          .join(', ');
        toast({
          title: 'Nenhuma entidade cadastrada',
          description: `Não há ${emptyTypes} cadastrados para atualizar. Adicione entidades primeiro.`,
          variant: 'destructive'
        });
        setIsUpdating(false);
        return;
      }

      // Create log entry with update_type
      const { data: logData, error: logError } = await supabase
        .from('update_logs')
        .insert({
          user_id: user.id,
          status: 'pending',
          entity_types: entityTypes,
          update_type: settings.update_type || 'full'
        })
        .select()
        .single();

      if (logError) throw logError;

      setCurrentLog(logData as UpdateLog);

      // Call SYNCHRONOUS edge function (waits for N8N response like manual flow)
      const { data, error } = await supabase.functions.invoke('batch-update-sync', {
        body: {
          user_id: user.id,
          entity_types: entityTypes,
          log_id: logData.id,
          update_type: settings.update_type || 'full',
          trigger_type: 'manual'
        }
      });

      if (error) throw error;
      
      // Edge function completed - update finished
      console.log('Batch update completed:', data);
      setIsUpdating(false);
      setCurrentLog(null);
      loadSettings();

    } catch (error) {
      console.error('Error triggering manual update:', error);
      setIsUpdating(false);
      setCurrentLog(null);
      toast({
        title: 'Erro ao iniciar',
        description: 'Não foi possível iniciar a atualização.',
        variant: 'destructive'
      });
    }
  };

  // Helper function to check entity counts
  const checkEntityCounts = async (entityTypes: string[]) => {
    const details: { type: string; label: string; count: number }[] = [];
    let total = 0;

    for (const type of entityTypes) {
      let entityCount = 0;
      let label = '';
      
      switch (type) {
        case 'competitor':
          label = 'concorrentes';
          const { count: compCount } = await supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'competitor');
          entityCount = compCount || 0;
          break;
        case 'prospect':
          label = 'prospects';
          const { count: prospCount } = await supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'prospect');
          entityCount = prospCount || 0;
          break;
        case 'client':
          label = 'clientes';
          const { count: clientCount } = await supabase
            .from('companies')
            .select('*', { count: 'exact', head: true })
            .eq('entity_type', 'client');
          entityCount = clientCount || 0;
          break;
      }

      if (label) {
        details.push({ type, label, count: entityCount });
        total += entityCount;
      }
    }

    return { total, details };
  };

  const cancelUpdate = async () => {
    if (!currentLog) return;

    try {
      const { error } = await supabase
        .from('update_logs')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', currentLog.id);

      if (error) throw error;

      setIsUpdating(false);
      setCurrentLog(null);
      loadSettings();

      toast({
        title: 'Atualização cancelada',
        description: 'A atualização foi cancelada.'
      });
    } catch (error) {
      console.error('Error cancelling update:', error);
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar a atualização.',
        variant: 'destructive'
      });
    }
  };

  const clearLogs = async () => {
    if (!user?.id) return;

    try {
      // Only delete completed, cancelled, failed, or timeout logs (not active ones)
      const { error } = await supabase
        .from('update_logs')
        .delete()
        .eq('user_id', user.id)
        .in('status', ['completed', 'cancelled', 'failed', 'timeout']);

      if (error) throw error;

      // Reload to get fresh data
      await loadSettings();
      
      toast({
        title: 'Histórico limpo',
        description: 'O histórico de atualizações foi limpo.'
      });
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast({
        title: 'Erro ao limpar',
        description: 'Não foi possível limpar o histórico.',
        variant: 'destructive'
      });
    }
  };

  return {
    settings,
    logs,
    isLoading,
    isUpdating,
    currentLog,
    updateSettings,
    triggerManualUpdate,
    cancelUpdate,
    clearLogs,
    refreshSettings: loadSettings
  };
}
