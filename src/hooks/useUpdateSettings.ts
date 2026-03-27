import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDateForSupabase } from '@/utils/helpers';

const WEBHOOK_FULL = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficial';
const WEBHOOK_CONTENT = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficialautomatico';
const WEBHOOK_NEWS = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/newsupdater';

// Entity table configurations
const entityConfig = {
  competitor: {
    table: 'companies',
    glassdoorTable: 'glassdoor_summary',
    glassdoorFk: 'company_id',
    leadershipTable: 'company_leadership',
    linkedinTable: 'linkedin_posts',
    instagramTable: 'instagram_posts',
    youtubeTable: 'youtube_videos',
    marketResearchTable: 'market_research',
    marketNewsTable: 'market_news',
    similarCompaniesTable: 'similar_companies',
    blogTable: 'company_blog_posts',
    fkColumn: 'company_id'
  },
  prospect: {
    table: 'prospects',
    glassdoorTable: 'prospect_glassdoor_summary',
    glassdoorFk: 'prospect_id',
    leadershipTable: 'prospect_leadership',
    linkedinTable: 'prospect_linkedin_posts',
    instagramTable: 'prospect_instagram_posts',
    youtubeTable: 'prospect_youtube_videos',
    marketResearchTable: 'prospect_market_research',
    marketNewsTable: 'prospect_market_news',
    similarCompaniesTable: 'prospect_similar_companies',
    blogTable: 'prospect_blog_posts',
    fkColumn: 'prospect_id'
  },
  client: {
    table: 'clients',
    glassdoorTable: 'client_glassdoor_summary',
    glassdoorFk: 'client_id',
    leadershipTable: 'client_leadership',
    linkedinTable: 'client_linkedin_posts',
    instagramTable: 'client_instagram_posts',
    youtubeTable: 'client_youtube_videos',
    marketResearchTable: 'client_market_research',
    marketNewsTable: 'client_market_news',
    similarCompaniesTable: 'client_similar_companies',
    blogTable: 'client_blog_posts',
    fkColumn: 'client_id'
  }
};

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

  // Logic to save data locally (replacing Edge Function logic)
  const saveEntityDataLocally = async (entityId: string, webhookData: any, entityType: string) => {
    const config = entityConfig[entityType as keyof typeof entityConfig];
    if (!config) return;

    let wData = Array.isArray(webhookData) ? webhookData[0] : (webhookData || {});
    if (wData.json) wData = wData.json;
    
    const overview = wData.company || wData.linkedin_info || wData.overview || {};
    const redes_sociais = wData.redes_sociais || {
      linkedin: { posts: wData.linkedin_posts },
      instagram: { posts: wData.instagram_posts },
      youtube: wData.youtube_info 
    };
    const mercado = wData.mercado || wData.market_research_raw || {};
    const glassdoor = wData.glassdoor_info || (redes_sociais?.glassdoor || wData.glassdoor);

    // Update main record
    const entityRecord: any = {
      name: overview?.nome || null,
      description: overview?.descricao_institucional || null,
      industry: overview?.setor || null,
      logo_url: wData.linkedin_logo || overview?.logo_url || wData.linkedin_info?.profile_pic_url || null,
      website: overview?.website || overview?.site_institucional || null,
      updated_at: new Date().toISOString()
    };

    // Add social metrics if available
    if (redes_sociais?.linkedin?.followers) entityRecord.linkedin_followers = redes_sociais.linkedin.followers;
    if (redes_sociais?.instagram?.profile?.followersCount) entityRecord.instagram_followers = redes_sociais.instagram.profile.followersCount;
    if (redes_sociais?.youtube?.channel?.subscribers) entityRecord.youtube_subscribers = redes_sociais.youtube.channel.subscribers;

    await supabase.from(config.table).update(entityRecord).eq('id', entityId);

    // Save News (additive)
    const newsData = mercado?.news_and_actions || mercado?.news_and_updates || wData.noticias || [];
    if (newsData.length > 0) {
      const newsToInsert = newsData.map((n: any) => ({
        [config.fkColumn]: entityId,
        title: n.titulo || n.title || null,
        url: n.url || null,
        date: formatDateForSupabase(n.data || n.date),
        summary: n.resumo || n.summary || null,
        classification: n.tipo || n.classification || null,
      })).filter((n: any) => n.title && n.url);

      if (newsToInsert.length > 0) {
        await supabase.from(config.marketNewsTable).upsert(newsToInsert, { 
          onConflict: `${config.fkColumn},url`,
          ignoreDuplicates: false 
        });
      }
    }
  };

  const triggerManualUpdate = async () => {
    if (!user?.id || !settings) return;

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
      const entityTypes: string[] = [];
      if (settings.update_competitors) entityTypes.push('competitor');
      if (settings.update_prospects) entityTypes.push('prospect');
      if (settings.update_clients) entityTypes.push('client');

      if (entityTypes.length === 0) {
        toast({ title: 'Nenhuma entidade selecionada', variant: 'destructive' });
        setIsUpdating(false);
        return;
      }

      // Step 1: Initialize Log
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

      // Step 2: Fetch Entities
      const allEntities: any[] = [];
      for (const type of entityTypes) {
        const table = entityConfig[type as keyof typeof entityConfig].table;
        const { data } = await supabase
          .from(table)
          .select('id, domain, name')
          .eq('entity_type', type);
        
        if (data) {
          data.forEach(item => allEntities.push({ ...item, entityType: type }));
        }
      }

      if (allEntities.length === 0) {
        await supabase.from('update_logs').update({ status: 'completed', total_entities: 0 }).eq('id', logData.id);
        setIsUpdating(false);
        return;
      }

      // Update total count
      await supabase.from('update_logs').update({ total_entities: allEntities.length, status: 'running' }).eq('id', logData.id);

      // Step 3: Sequential processing in frontend
      let updatedCount = 0;
      const isNewsOnly = settings.update_type === 'news_only';
      const webhookUrl = isNewsOnly ? WEBHOOK_NEWS : (settings.update_type === 'content_news' ? WEBHOOK_CONTENT : WEBHOOK_FULL);

      for (const entity of allEntities) {
        try {
          // Update log current progress
          await supabase.from('update_logs').update({ 
            current_entity_name: entity.name, 
            current_entity_domain: entity.domain,
            entities_updated: updatedCount
          }).eq('id', logData.id);

          // Call Webhook
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: entity.domain, entity_id: entity.id, entity_type: entity.entityType, user_id: user.id })
          });

          if (response.ok) {
            const data = await response.json();
            // Save data locally
            await saveEntityDataLocally(entity.id, data, entity.entityType);
            updatedCount++;
          }
        } catch (err) {
          console.error(`Error updating ${entity.domain}:`, err);
        }
      }

      // Step 4: Finalize
      await supabase.from('update_logs').update({ 
        status: 'completed', 
        entities_updated: updatedCount,
        completed_at: new Date().toISOString()
      }).eq('id', logData.id);

      setIsUpdating(false);
      setCurrentLog(null);
      loadSettings();
      toast({ title: 'Atualização concluída', description: `${updatedCount} de ${allEntities.length} processados.` });

    } catch (error) {
      console.error('Error triggering manual update:', error);
      setIsUpdating(false);
      setCurrentLog(null);
      toast({ title: 'Erro crítico', description: 'Falha durante o processamento do lote.', variant: 'destructive' });
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
