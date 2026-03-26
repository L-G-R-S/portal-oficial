import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface PrimaryCompany {
  id: string;
  user_id: string;
  domain: string;
  name: string | null;
  description: string | null;
  logo_url: string | null;
  industry: string | null;
  sector: string | null;
  website: string | null;
  headquarters: string | null;
  employee_count: number | null;
  year_founded: number | null;
  linkedin_url: string | null;
  linkedin_followers: number | null;
  instagram_url: string | null;
  instagram_followers: number | null;
  youtube_url: string | null;
  youtube_subscribers: number | null;
  analyzed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function usePrimaryCompany() {
  const [primaryCompany, setPrimaryCompany] = useState<PrimaryCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadPrimaryCompany = useCallback(async () => {
    try {
      setIsLoading(true);
      // Busca a empresa principal do sistema (agora global via RLS)
      const { data: primaryData, error: primaryError } = await supabase
        .from("primary_company")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (primaryError) throw primaryError;
      
      if (!primaryData) {
        setPrimaryCompany(null);
        return;
      }

      // Busca o ID correspondente na tabela companies para garantir que a navegação
      // para a página de detalhes (que usa a tabela companies) funcione corretamente.
      const { data: companyData } = await supabase
        .from("companies")
        .select("id")
        .eq("domain", primaryData.domain)
        .maybeSingle();

      setPrimaryCompany({
        ...primaryData,
        id: companyData?.id || primaryData.id // Usa o ID da companies para navegação
      } as PrimaryCompany | null);
    } catch (error) {
      console.error("Error loading primary company:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrimaryCompany();
  }, [loadPrimaryCompany]);

  const savePrimaryCompany = async (domain: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Busca QUALQUER empresa principal existente (global)
      const { data: existing } = await supabase
        .from("primary_company")
        .select("id")
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        // Atualiza a empresa principal global
        // Só reseta analyzed_at se o domínio for DIFERENTE do atual
        const { data: currentData } = await supabase.from("primary_company").select("domain").eq("id", existing.id).single();
        const shouldResetAnalysis = currentData?.domain !== domain;

        const { data, error } = await supabase
          .from("primary_company")
          .update({ 
            domain, 
            ...(shouldResetAnalysis ? { analyzed_at: null } : {}),
            user_id: user.id // Registra quem fez a última alteração
          })
          .eq("id", existing.id)
          .select("id")
          .single();

        if (error) throw error;
        toast({
          title: "Empresa principal atualizada",
          description: `O domínio foi alterado para ${domain}.`,
        });
        return data.id;
      } else {
        // Insere a primeira empresa principal
        const { data, error } = await supabase
          .from("primary_company")
          .insert({ user_id: user.id, domain })
          .select("id")
          .single();

        if (error) throw error;
        toast({
          title: "Empresa principal salva",
          description: "Sua empresa foi configurada com sucesso.",
        });
        return data.id;
      }
    } catch (error) {
      console.error("Error saving primary company:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a empresa principal. Verifique se você tem permissão de Super Admin.",
        variant: "destructive",
      });
      return null;
    }
  };

  const removePrimaryCompany = async (): Promise<boolean> => {
    if (!primaryCompany) return false;

    try {
      const { error } = await supabase
        .from("primary_company")
        .delete()
        .eq("id", primaryCompany.id);

      if (error) throw error;

      setPrimaryCompany(null);
      toast({
        title: "Empresa removida",
        description: "A empresa principal foi removida com sucesso para todo o sistema.",
      });
      return true;
    } catch (error) {
      console.error("Error removing primary company:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a empresa principal. Apenas Super Admins podem realizar esta ação.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    primaryCompany,
    isLoading,
    loadPrimaryCompany,
    savePrimaryCompany,
    removePrimaryCompany,
  };
}
