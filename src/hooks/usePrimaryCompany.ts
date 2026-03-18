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
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Busca a empresa principal do sistema (única para todos os usuários)
      const { data, error } = await supabase
        .from("primary_company")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      setPrimaryCompany(data as PrimaryCompany | null);
    } catch (error) {
      console.error("Error loading primary company:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPrimaryCompany();
  }, [loadPrimaryCompany]);

  const savePrimaryCompany = async (domain: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // Check if user already has a primary company
      const { data: existing } = await supabase
        .from("primary_company")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("primary_company")
          .update({ domain, analyzed_at: null })
          .eq("id", existing.id)
          .select("id")
          .single();

        if (error) throw error;
        return data.id;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("primary_company")
          .insert({ user_id: user.id, domain })
          .select("id")
          .single();

        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error("Error saving primary company:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a empresa principal.",
        variant: "destructive",
      });
      return null;
    }
  };

  const removePrimaryCompany = async (): Promise<boolean> => {
    if (!user?.id || !primaryCompany) return false;

    try {
      const { error } = await supabase
        .from("primary_company")
        .delete()
        .eq("id", primaryCompany.id);

      if (error) throw error;

      setPrimaryCompany(null);
      toast({
        title: "Empresa removida",
        description: "Sua empresa principal foi removida com sucesso.",
      });
      return true;
    } catch (error) {
      console.error("Error removing primary company:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a empresa principal.",
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
