import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type EntityType = "competitor" | "prospect" | "client" | "primary";

const entityLabels: Record<EntityType, string> = {
  competitor: "concorrente",
  prospect: "prospect",
  client: "cliente",
  primary: "empresa principal",
};

export interface EntityDetailData {
  entity: any;
  glassdoor: any;
  marketResearch: any;
  similarCompanies: any[];
  marketNews: any[];
  leadership: any[];
  socialPosts: {
    linkedin: any[];
    instagram: any[];
    youtube: any[];
    blog: any[];
  };
}

export function useEntityDetail(entityType: EntityType, id: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<EntityDetailData | null>(null);
  const { toast } = useToast();

  const label = entityLabels[entityType];

  const loadAllData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      // Fetch main entity
      const { data: entityData, error: entityError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (entityError) throw entityError;
      if (!entityData) {
        setData(null);
        return;
      }

      const entityId = entityData.id;

      // Fetch related data based on configured table names
      const results = await Promise.all([
        supabase.from("glassdoor_summary").select("*").eq("company_id", entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("market_research").select("*").eq("company_id", entityId).maybeSingle(),
        supabase.from("similar_companies").select("*").eq("company_id", entityId),
        supabase.from("market_news").select("*").eq("company_id", entityId).order("date", { ascending: false }),
        supabase.from("company_leadership").select("*").eq("company_id", entityId).order("relevance_score", { ascending: false }),
        supabase.from("linkedin_posts").select("*").eq("company_id", entityId).order("posted_at", { ascending: false }).limit(50),
        supabase.from("instagram_posts").select("*").eq("company_id", entityId).order("timestamp", { ascending: false }).limit(50),
        supabase.from("youtube_videos").select("*").eq("company_id", entityId).order("published_at", { ascending: false }).limit(50),
        supabase.from("company_blog_posts").select("*").eq("company_id", entityId).order("published_at", { ascending: false }).limit(50),
      ]);

      setData({
        entity: entityData,
        glassdoor: results[0].data,
        marketResearch: results[1].data,
        similarCompanies: results[2].data || [],
        marketNews: results[3].data || [],
        leadership: results[4].data || [],
        socialPosts: {
          linkedin: results[5].data || [],
          instagram: results[6].data || [],
          youtube: results[7].data || [],
          blog: results[8].data || [],
        },
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: `Não foi possível carregar os detalhes do ${label}.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, entityType, label, toast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return { isLoading, data, reload: loadAllData };
}
