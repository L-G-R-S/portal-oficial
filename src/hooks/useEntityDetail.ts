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

      const tableConfig: Record<EntityType, {
        main: string;
        glassdoor: string;
        market: string;
        similar: string;
        news: string;
        leadership: string;
        linkedin: string;
        instagram: string;
        youtube: string;
        blog: string;
        idCol: string;
      }> = {
        competitor: {
          main: "companies", glassdoor: "glassdoor_summary", market: "market_research",
          similar: "similar_companies", news: "market_news", leadership: "company_leadership",
          linkedin: "linkedin_posts", instagram: "instagram_posts", youtube: "youtube_videos",
          blog: "company_blog_posts", idCol: "company_id"
        },
        prospect: {
          main: "prospects", glassdoor: "prospect_glassdoor_summary", market: "prospect_market_research",
          similar: "prospect_similar_companies", news: "prospect_market_news", leadership: "prospect_leadership",
          linkedin: "prospect_linkedin_posts", instagram: "prospect_instagram_posts", youtube: "prospect_youtube_videos",
          blog: "prospect_blog_posts", idCol: "prospect_id"
        },
        client: {
          main: "clients", glassdoor: "client_glassdoor_summary", market: "client_market_research",
          similar: "client_similar_companies", news: "client_market_news", leadership: "client_leadership",
          linkedin: "client_linkedin_posts", instagram: "client_instagram_posts", youtube: "client_youtube_videos",
          blog: "client_blog_posts", idCol: "client_id"
        },
        primary: {
          main: "primary_company", glassdoor: "primary_company_glassdoor", market: "primary_company_market_research",
          similar: "primary_company_similar_companies", news: "primary_company_market_news", leadership: "primary_company_leadership",
          linkedin: "primary_company_linkedin_posts", instagram: "primary_company_instagram_posts", youtube: "primary_company_youtube_videos",
          blog: "primary_company_blog_posts", idCol: "primary_company_id"
        }
      };

      const t = tableConfig[entityType];

      // Fetch main entity
      const { data: entityData, error: entityError } = await supabase
        .from(t.main)
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
        supabase.from(t.glassdoor).select("*").eq(t.idCol, entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from(t.market).select("*").eq(t.idCol, entityId).maybeSingle(),
        supabase.from(t.similar).select("*").eq(t.idCol, entityId),
        supabase.from(t.news).select("*").eq(t.idCol, entityId).order("date", { ascending: false }),
        supabase.from(t.leadership).select("*").eq(t.idCol, entityId).order("relevance_score", { ascending: false }),
        supabase.from(t.linkedin).select("*").eq(t.idCol, entityId).order("posted_at", { ascending: false }).limit(50),
        supabase.from(t.instagram).select("*").eq(t.idCol, entityId).order("timestamp", { ascending: false }).limit(50),
        supabase.from(t.youtube).select("*").eq(t.idCol, entityId).order("published_at", { ascending: false }).limit(50),
        supabase.from(t.blog).select("*").eq(t.idCol, entityId).order("published_at", { ascending: false }).limit(50),
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
