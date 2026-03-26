import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { useSaveCompetitor } from "@/hooks/useSaveCompetitor";
import { WEBHOOK_URL, ROUTES } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { useUserAction } from "@/hooks/useUserAction";

export type EntityType = 'competitor' | 'prospect' | 'client' | 'primary';

export interface AnalysisState {
  id: string;
  status: 'analyzing' | 'completed' | 'error';
  domain: string;
  entityType: EntityType;
  progress: number;
  message: string;
  startedAt: Date;
}

interface AnalysisContextType {
  analyses: Map<string, AnalysisState>;
  isAnalyzing: (domain: string) => boolean;
  hasActiveAnalyses: boolean;
  activeAnalysesCount: number;
  startAnalysis: (domain: string, entityType?: EntityType) => Promise<void>;
  cancelAnalysis: (domain: string) => void;
  cancelAllAnalyses: () => void;
  onAnalysisComplete: (domain: string, cb: (entityId: string | null, route: string) => void) => () => void;
}

const MAX_CONCURRENT_ANALYSES = 300;

const progressMessages = [
  "Aguarde, pode demorar até 2 minutos...",
  "Estamos buscando os dados da empresa...",
  "Analisando informações públicas...",
  "Coletando dados de redes sociais...",
  "Organizando o relatório...",
  "Processando informações da empresa...",
  "Buscando notícias recentes...",
  "Quase lá, finalizando a análise...",
];

const entityLabels: Record<EntityType, { singular: string; plural: string; table: string; route: string; analyzeRoute: string }> = {
  competitor: { singular: 'concorrente', plural: 'concorrentes', table: 'companies', route: ROUTES.COMPETITOR_DETAIL, analyzeRoute: ROUTES.ANALISE_INTELIGENTE },
  prospect: { singular: 'prospect', plural: 'prospects', table: 'companies', route: ROUTES.PROSPECT_DETAIL, analyzeRoute: ROUTES.ANALISE_PROSPECT },
  client: { singular: 'cliente', plural: 'clientes', table: 'companies', route: ROUTES.CLIENT_DETAIL, analyzeRoute: ROUTES.ANALISE_CLIENTE },
  primary: { singular: 'empresa principal', plural: 'empresas principais', table: 'companies', route: '/configuracoes', analyzeRoute: '/configuracoes' },
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

type CompleteCb = (entityId: string | null, route: string) => void;
const completionCallbacks = new Map<string, Set<CompleteCb>>();

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analyses, setAnalyses] = useState<Map<string, AnalysisState>>(new Map());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const messageIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const onAnalysisComplete = useCallback((domain: string, cb: CompleteCb) => {
    if (!completionCallbacks.has(domain)) completionCallbacks.set(domain, new Set());
    completionCallbacks.get(domain)!.add(cb);
    return () => { completionCallbacks.get(domain)?.delete(cb); };
  }, []);

  const { toast } = useToast();
  const { addNotification, playNotificationSound } = useNotificationContext();
  const { saveCompetitor } = useSaveCompetitor();
  const { trackAction } = useUserAction();

  // Cleanup message intervals when analyses change
  useEffect(() => {
    return () => {
      messageIntervalsRef.current.forEach((interval) => clearInterval(interval));
      messageIntervalsRef.current.clear();
    };
  }, []);

  const isAnalyzing = useCallback((domain: string) => {
    const analysis = analyses.get(domain);
    return analysis?.status === 'analyzing';
  }, [analyses]);

  const hasActiveAnalyses = analyses.size > 0 && Array.from(analyses.values()).some(a => a.status === 'analyzing');
  const activeAnalysesCount = Array.from(analyses.values()).filter(a => a.status === 'analyzing').length;

  const updateAnalysisMessage = useCallback((domain: string) => {
    setAnalyses(prev => {
      const newMap = new Map(prev);
      const analysis = newMap.get(domain);
      if (analysis && analysis.status === 'analyzing') {
        const currentIndex = progressMessages.indexOf(analysis.message);
        const nextIndex = (currentIndex + 1) % progressMessages.length;
        newMap.set(domain, { ...analysis, message: progressMessages[nextIndex] });
      }
      return newMap;
    });
  }, []);

  const startAnalysis = useCallback(async (domain: string, entityType: EntityType = 'competitor') => {
    // Check if already analyzing this domain
    if (isAnalyzing(domain)) {
      toast({
        title: "Análise em andamento",
        description: `Já existe uma análise em andamento para ${domain}.`,
        variant: "destructive",
      });
      return;
    }

    // Check concurrent limit
    if (activeAnalysesCount >= MAX_CONCURRENT_ANALYSES) {
      toast({
        title: "Limite atingido",
        description: `Você pode executar no máximo ${MAX_CONCURRENT_ANALYSES} análises simultâneas. Aguarde uma análise concluir.`,
        variant: "destructive",
      });
      return;
    }

    const labels = entityLabels[entityType];
    const abortController = new AbortController();
    abortControllersRef.current.set(domain, abortController);

    const analysisId = `${domain}-${Date.now()}`;
    const newAnalysis: AnalysisState = {
      id: analysisId,
      status: 'analyzing',
      domain,
      entityType,
      progress: 0,
      message: progressMessages[0],
      startedAt: new Date(),
    };

    setAnalyses(prev => {
      const newMap = new Map(prev);
      newMap.set(domain, newAnalysis);
      return newMap;
    });

    trackAction('nova_analise', `Iniciou análise para ${domain} (${labels.singular})`);

    // Start message rotation for this analysis
    const messageInterval = setInterval(() => updateAnalysisMessage(domain), 4000);
    messageIntervalsRef.current.set(domain, messageInterval);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
        },
        body: JSON.stringify({ domain, entityType }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro do servidor:", errorText);
        
        if (response.status === 406) {
          throw new Error("O webhook não está aceitando a requisição.");
        }
        throw new Error(`Erro HTTP ${response.status}: ${errorText || "Erro desconhecido"}`);
      }

      const textResponse = await response.text();
      let webhookData;

      if (textResponse) {
        try {
          let parsed = JSON.parse(textResponse);
          if (Array.isArray(parsed) && parsed.length > 0) {
            webhookData = parsed[0];
          } else {
            webhookData = parsed;
          }
          
          if (webhookData?.json) {
            webhookData = webhookData.json;
          }
        } catch {
          throw new Error("Resposta inválida do servidor");
        }
      } else {
        throw new Error("Webhook retornou resposta vazia");
      }

      const companyData = webhookData?.overview || webhookData?.company || webhookData?.linkedin_info;
      if (!companyData || typeof companyData !== 'object') {
        console.error("Estrutura recebida:", JSON.stringify(webhookData, null, 2));
        throw new Error("Estrutura de dados do webhook está incorreta");
      }

      // Debug logs for primary company
      if (entityType === 'primary') {
        console.log("=== PRIMARY COMPANY WEBHOOK DATA ===");
        console.log("Has overview:", !!webhookData?.overview);
        console.log("Overview keys:", webhookData?.overview ? Object.keys(webhookData.overview) : []);
        console.log("Company name:", companyData?.name);
        console.log("Logo URL:", companyData?.logo_url);
        console.log("Industry:", companyData?.industry);
        console.log("=== END PRIMARY COMPANY DEBUG ===");
      }

      const companyName = companyData.name || companyData.nome || domain;
      const completedAt = new Date();
      const durationSeconds = Math.round((completedAt.getTime() - newAnalysis.startedAt.getTime()) / 1000);

      // Salvar automaticamente baseado no tipo de entidade
      const saved = await saveCompetitor({ webhookData, domain, entityType });

      // Get the entity ID from the database (all entity types use companies table)
      let entityId: string | null = null;
      const { data: entityRecord } = await supabase
        .from('companies')
        .select('id')
        .eq('domain', domain)
        .maybeSingle();
      entityId = entityRecord?.id || null;

      // Log the activity to analysis_activity_log
      if (entityId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('analysis_activity_log').insert({
            user_id: user.id,
            entity_id: entityId,
            entity_type: entityType,
            entity_name: companyName,
            entity_domain: domain,
            trigger_type: 'manual_single',
            update_type: 'full',
            status: saved ? 'success' : 'failed',
            started_at: newAnalysis.startedAt.toISOString(),
            completed_at: completedAt.toISOString(),
            duration_seconds: durationSeconds,
            error_message: saved ? null : 'Erro ao salvar dados',
          });
        }
      }

      if (saved) {
        // Fire completion callbacks
        const cbs = completionCallbacks.get(domain);
        if (cbs) {
          const detailRoute = entityId ? `${labels.route}/${entityId}` : null;
          cbs.forEach(cb => cb(entityId, detailRoute || labels.analyzeRoute));
          completionCallbacks.delete(domain);
        }

        addNotification({
          title: "Análise Concluída",
          message: `A análise de ${companyName} foi concluída com sucesso.`,
          type: 'success',
          action_url: entityId ? `${labels.route}/${entityId}` : labels.analyzeRoute,
        });
        playNotificationSound();

        toast({
          title: "Análise concluída!",
          description: `${companyName} foi salvo na lista de ${labels.plural}.`,
        });
      } else {
        addNotification({
          title: "Análise Concluída",
          message: `A análise de ${companyName} foi concluída, mas houve erro ao salvar.`,
          type: 'error',
          action_url: labels.analyzeRoute,
        });
        playNotificationSound();
      }

      // Mark as completed and remove from active analyses
      setAnalyses(prev => {
        const newMap = new Map(prev);
        newMap.delete(domain);
        return newMap;
      });

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Analysis was cancelled, already handled
        return;
      }

      const completedAt = new Date();
      const durationSeconds = Math.round((completedAt.getTime() - newAnalysis.startedAt.getTime()) / 1000);

      // Log the failed analysis
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('analysis_activity_log').insert({
          user_id: user.id,
          entity_id: '00000000-0000-0000-0000-000000000000', // Placeholder for failed analyses without entity
          entity_type: entityType,
          entity_name: domain,
          entity_domain: domain,
          trigger_type: 'manual_single',
          update_type: 'full',
          status: 'failed',
          started_at: newAnalysis.startedAt.toISOString(),
          completed_at: completedAt.toISOString(),
          duration_seconds: durationSeconds,
          error_message: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }

      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Não foi possível completar a análise.",
        variant: "destructive",
      });

      addNotification({
        title: "Falha na Análise",
        message: `A análise de ${domain} encontrou um erro: ${error instanceof Error ? error.message : "Erro desconhecido"}.`,
        type: 'error',
      });
      playNotificationSound();

      // Mark as error and remove
      setAnalyses(prev => {
        const newMap = new Map(prev);
        newMap.delete(domain);
        return newMap;
      });
    } finally {
      // Cleanup
      const interval = messageIntervalsRef.current.get(domain);
      if (interval) {
        clearInterval(interval);
        messageIntervalsRef.current.delete(domain);
      }
      abortControllersRef.current.delete(domain);
    }
  }, [isAnalyzing, activeAnalysesCount, toast, addNotification, playNotificationSound, saveCompetitor, updateAnalysisMessage]);

  const cancelAnalysis = useCallback((domain: string) => {
    const abortController = abortControllersRef.current.get(domain);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(domain);
    }

    const interval = messageIntervalsRef.current.get(domain);
    if (interval) {
      clearInterval(interval);
      messageIntervalsRef.current.delete(domain);
    }

    setAnalyses(prev => {
      const newMap = new Map(prev);
      newMap.delete(domain);
      return newMap;
    });

    toast({
      title: "Análise cancelada",
      description: `A análise de ${domain} foi cancelada.`,
    });
  }, [toast]);

  const cancelAllAnalyses = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    abortControllersRef.current.clear();

    messageIntervalsRef.current.forEach((interval) => clearInterval(interval));
    messageIntervalsRef.current.clear();

    setAnalyses(new Map());

    toast({
      title: "Análises canceladas",
      description: "Todas as análises em andamento foram canceladas.",
    });
  }, [toast]);

  return (
    <AnalysisContext.Provider value={{ 
      analyses, 
      isAnalyzing, 
      hasActiveAnalyses,
      activeAnalysesCount,
      startAnalysis, 
      cancelAnalysis,
      cancelAllAnalyses,
      onAnalysisComplete
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysisContext must be used within an AnalysisProvider");
  }
  return context;
}
