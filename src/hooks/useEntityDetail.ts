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

      // Determine table names based on entity type (following the webhook Edge Function schema)
      const isProspect = entityType === 'prospect';
      const isClient = entityType === 'client';
      // 'primary' and 'competitor' use the exact same tables
      
      const newsTable = isProspect ? 'prospect_market_news' : isClient ? 'client_market_news' : 'market_news';
      const researchTable = isProspect ? 'prospect_market_research' : isClient ? 'client_market_research' : 'market_research';
      const glassdoorTable = isProspect ? 'prospect_glassdoor_summary' : isClient ? 'client_glassdoor_summary' : 'glassdoor_summary';
      const similarTable = isProspect ? 'prospect_similar_companies' : isClient ? 'client_similar_companies' : 'similar_companies';
      const leadershipTable = isProspect ? 'prospect_leadership' : isClient ? 'client_leadership' : 'company_leadership';
      const linkedinTable = isProspect ? 'prospect_linkedin_posts' : isClient ? 'client_linkedin_posts' : 'linkedin_posts';
      const instagramTable = isProspect ? 'prospect_instagram_posts' : isClient ? 'client_instagram_posts' : 'instagram_posts';
      const youtubeTable = isProspect ? 'prospect_youtube_videos' : isClient ? 'client_youtube_videos' : 'youtube_videos';
      const blogTable = "company_blog_posts";
      
      const idColumn = isProspect ? 'prospect_id' : isClient ? 'client_id' : 'company_id';

      // Fetch related data based on configured table names
      const results = await Promise.all([
        supabase.from(glassdoorTable as any).select("*").eq(idColumn, entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from(researchTable as any).select("*").eq(idColumn, entityId).maybeSingle(),
        supabase.from(similarTable as any).select("*").eq(idColumn, entityId),
        supabase.from(newsTable as any).select("*").eq(idColumn, entityId).order("data", { ascending: false }),
        supabase.from(leadershipTable as any).select("*").eq(idColumn, entityId).order("relevance_score", { ascending: false }),
        supabase.from(linkedinTable as any).select("*").eq(idColumn, entityId).order("posted_at", { ascending: false }).limit(50),
        supabase.from(instagramTable as any).select("*").eq(idColumn, entityId).order("timestamp", { ascending: false }).limit(50),
        supabase.from(youtubeTable as any).select("*").eq(idColumn, entityId).order("published_at", { ascending: false }).limit(50),
        supabase.from(blogTable).select("*").eq("company_id", entityId).order("published_at", { ascending: false }).limit(50),
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
