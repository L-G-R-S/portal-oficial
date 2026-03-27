import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDateForSupabase } from "@/utils/helpers";

type EntityType = 'competitor' | 'prospect' | 'client' | 'primary';
// ... (rest of imports and types)

interface UseUpdateNewsReturn {
  isUpdating: boolean;
  updateNews: (entityId: string, domain: string, entityType: EntityType) => Promise<boolean>;
}

export function useUpdateNews(): UseUpdateNewsReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const updateNews = async (entityId: string, domain: string, entityType: EntityType): Promise<boolean> => {
    if (!entityId || !domain) {
      toast({
        title: "Erro",
        description: "Dados da entidade não disponíveis.",
        variant: "destructive",
      });
      return false;
    }

    setIsUpdating(true);
    
    try {
      toast({
        title: "Solicitando notícias",
        description: `Buscando atualizações para ${domain}...`,
      });

      // Chamada direta ao webhook do N8N conforme solicitado (outra forma)
      const WEBHOOK_URL = "https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/newsupdater";
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          domain, 
          entityId, 
          entityType,
          user_id: user?.id,
          trigger_source: 'frontend_manual'
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na conexão: ${response.statusText}`);
      }

      // Processar a resposta do webhook para persistir os dados
      const webhookResponseData = await response.json();
      console.log('[useUpdateNews] Webhook response:', webhookResponseData);

      // Extrair notícias seguindo a estrutura fornecida pelo usuário
      let newsItems: any[] = [];
      let references: string[] = [];
      
      const data = Array.isArray(webhookResponseData) ? webhookResponseData[0] : webhookResponseData;
      
      // Padrão Único (market_research_raw.news_and_market_actions)
      newsItems = data?.market_research_raw?.news_and_market_actions || [];
      references = data?.market_research_raw?.references || [];

      if (newsItems.length > 0) {
        // Determinar tabela e coluna baseada no tipo
        let tableName: string;
        let idColumn: string;

        switch (entityType) {
          case 'competitor': tableName = 'market_news'; idColumn = 'company_id'; break;
          case 'prospect': tableName = 'prospect_market_news'; idColumn = 'prospect_id'; break;
          case 'client': tableName = 'client_market_news'; idColumn = 'client_id'; break;
          case 'primary': tableName = 'primary_company_market_news'; idColumn = 'primary_company_id'; break;
          default: throw new Error(`Tipo de entidade desconhecido: ${entityType}`);
        }

        // Mapear notícias para o formato do banco
        const newsToInsert = newsItems.map(item => ({
          [idColumn]: entityId,
          titulo: (item.titulo || item.title || "").trim() || null,
          url: (item.url || item.link || "").trim() || null,
          data: formatDateForSupabase(item.data || item.date),
          resumo: item.resumo || item.summary || null,
          tipo: item.tipo || item.classification || null,
          fonte: item.fonte || item.source || null,
        })).filter(n => n.titulo && n.url); // Garantir dados mínimos e válidos

        if (newsToInsert.length > 0) {
          // Inserir no banco via cliente Supabase do frontend (RLS permite)
          // Usando array de colunas para o conflito
          const { error: insertError } = await supabase
            .from(tableName as any)
            .upsert(newsToInsert, { 
              onConflict: `${idColumn},url`,
              ignoreDuplicates: false 
            });

          if (insertError) {
            console.error('[useUpdateNews] Error saving news:', insertError);
            throw new Error(`Erro ao salvar notícias: ${insertError.message}`);
          }
        }

        // Atualizar referências se disponíveis
        if (references.length > 0) {
          let researchTable: string;
          switch (entityType) {
            case 'competitor': researchTable = 'market_research'; break;
            case 'prospect': researchTable = 'prospect_market_research'; break;
            case 'client': researchTable = 'client_market_research'; break;
            case 'primary': researchTable = 'primary_company_market_research'; break;
            default: researchTable = 'market_research';
          }

          const { data: existingResearch } = await supabase
            .from(researchTable as any)
            .select('source_references')
            .eq(idColumn, entityId)
            .maybeSingle();

          const researchData = existingResearch as any;
          const newRefs = references.join(", ");
          await supabase
            .from(researchTable as any)
            .upsert({
              [idColumn]: entityId,
              source_references: researchData?.source_references 
                ? `${researchData.source_references}, ${newRefs}`
                : newRefs
            }, { onConflict: idColumn });
        }

        // Criar notificação para o usuário (sininho)
        if (user?.id) {
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Notícias atualizadas',
            message: `${newsToInsert.length} nova(s) notícia(s) para ${domain}`,
            type: 'success',
          });
        }

        toast({
          title: "Notícias atualizadas!",
          description: `${newsToInsert.length} notícia(s) foram processadas e salvas com sucesso.`,
        });
      } else {
        toast({
          title: "Sem novidades",
          description: `Nenhuma notícia nova encontrada para ${domain} no momento.`,
        });
      }

      return true;
    } catch (error: any) {
      console.error('[useUpdateNews] Error:', error);
      toast({
        title: "Erro ao atualizar notícias",
        description: "Não foi possível processar os dados do servidor. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateNews };
}
