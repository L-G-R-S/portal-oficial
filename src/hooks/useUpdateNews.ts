import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type EntityType = 'competitor' | 'prospect' | 'client' | 'primary';

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
        title: "Atualizando notícias",
        description: `Buscando notícias para ${domain}...`,
      });

      const { data, error } = await supabase.functions.invoke('update-news', {
        body: { 
          entityId, 
          domain, 
          entityType,
          user_id: user?.id // Pass user_id for notification creation
        },
      });

      if (error) {
        throw new Error(error.message || 'Erro ao chamar função de atualização');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Notícias atualizadas",
        description: data?.message || `Notícias de ${domain} atualizadas com sucesso.`,
      });

      return true;
    } catch (error: any) {
      console.error('[useUpdateNews] Error:', error);
      toast({
        title: "Erro ao atualizar notícias",
        description: error.message || "Não foi possível atualizar as notícias.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateNews };
}
