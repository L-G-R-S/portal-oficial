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

      let entityData: any = null;
      let entityId: string = id;

      // Fetch main entity based on type
      if (entityType === "competitor") {
        const { data: d, error } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        entityData = d;
      } else if (entityType === "prospect") {
        const { data: d, error } = await supabase.from("prospects").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        entityData = d;
      } else if (entityType === "client") {
        const { data: d, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        entityData = d;
      } else {
        // primary
        const { data: d, error } = await supabase.from("primary_company").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        entityData = d;
      }

      if (!entityData) {
        setData(null);
        return;
      }

      entityId = entityData.id;

      // Fetch related data based on entity type
      let glassdoorData: any = null;
      let marketData: any = null;
      let similarCompaniesData: any[] = [];
      let marketNewsData: any[] = [];
      let leadershipData: any[] = [];
      let linkedinPosts: any[] = [];
      let instagramPosts: any[] = [];
      let youtubeVideos: any[] = [];

      if (entityType === "competitor") {
        const results = await Promise.all([
          supabase.from("glassdoor_summary").select("*").eq("company_id", entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("market_research").select("*").eq("company_id", entityId).maybeSingle(),
          supabase.from("similar_companies").select("*").eq("company_id", entityId),
          supabase.from("market_news").select("*").eq("company_id", entityId).order("date", { ascending: false }),
          supabase.from("company_leadership").select("*").eq("company_id", entityId).order("relevance_score", { ascending: false }),
          supabase.from("linkedin_posts").select("*").eq("company_id", entityId).order("posted_at", { ascending: false }).limit(50),
          supabase.from("instagram_posts").select("*").eq("company_id", entityId).order("timestamp", { ascending: false }).limit(50),
          supabase.from("youtube_videos").select("*").eq("company_id", entityId).order("published_at", { ascending: false }).limit(50),
        ]);
        glassdoorData = results[0].data;
        marketData = results[1].data;
        similarCompaniesData = results[2].data || [];
        marketNewsData = results[3].data || [];
        leadershipData = results[4].data || [];
        linkedinPosts = results[5].data || [];
        instagramPosts = results[6].data || [];
        youtubeVideos = results[7].data || [];
      } else if (entityType === "prospect") {
        const results = await Promise.all([
          supabase.from("prospect_glassdoor_summary").select("*").eq("prospect_id", entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("prospect_market_research").select("*").eq("prospect_id", entityId).maybeSingle(),
          supabase.from("prospect_similar_companies").select("*").eq("prospect_id", entityId),
          supabase.from("prospect_market_news").select("*").eq("prospect_id", entityId).order("date", { ascending: false }),
          supabase.from("prospect_leadership").select("*").eq("prospect_id", entityId).order("relevance_score", { ascending: false }),
          supabase.from("prospect_linkedin_posts").select("*").eq("prospect_id", entityId).order("posted_at", { ascending: false }).limit(50),
          supabase.from("prospect_instagram_posts").select("*").eq("prospect_id", entityId).order("timestamp", { ascending: false }).limit(50),
          supabase.from("prospect_youtube_videos").select("*").eq("prospect_id", entityId).order("published_at", { ascending: false }).limit(50),
        ]);
        glassdoorData = results[0].data;
        marketData = results[1].data;
        similarCompaniesData = results[2].data || [];
        marketNewsData = results[3].data || [];
        leadershipData = results[4].data || [];
        linkedinPosts = results[5].data || [];
        instagramPosts = results[6].data || [];
        youtubeVideos = results[7].data || [];
      } else if (entityType === "client") {
        const results = await Promise.all([
          supabase.from("client_glassdoor_summary").select("*").eq("client_id", entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("client_market_research").select("*").eq("client_id", entityId).maybeSingle(),
          supabase.from("client_similar_companies").select("*").eq("client_id", entityId),
          supabase.from("client_market_news").select("*").eq("client_id", entityId).order("date", { ascending: false }),
          supabase.from("client_leadership").select("*").eq("client_id", entityId).order("relevance_score", { ascending: false }),
          supabase.from("client_linkedin_posts").select("*").eq("client_id", entityId).order("posted_at", { ascending: false }).limit(50),
          supabase.from("client_instagram_posts").select("*").eq("client_id", entityId).order("timestamp", { ascending: false }).limit(50),
          supabase.from("client_youtube_videos").select("*").eq("client_id", entityId).order("published_at", { ascending: false }).limit(50),
        ]);
        glassdoorData = results[0].data;
        marketData = results[1].data;
        similarCompaniesData = results[2].data || [];
        marketNewsData = results[3].data || [];
        leadershipData = results[4].data || [];
        linkedinPosts = results[5].data || [];
        instagramPosts = results[6].data || [];
        youtubeVideos = results[7].data || [];
      } else {
        // primary
        const results = await Promise.all([
          supabase.from("primary_company_glassdoor").select("*").eq("primary_company_id", entityId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("primary_company_market_research").select("*").eq("primary_company_id", entityId).maybeSingle(),
          supabase.from("primary_company_similar_companies").select("*").eq("primary_company_id", entityId),
          supabase.from("primary_company_market_news").select("*").eq("primary_company_id", entityId).order("date", { ascending: false }),
          supabase.from("primary_company_leadership").select("*").eq("primary_company_id", entityId).order("relevance_score", { ascending: false }),
          supabase.from("primary_company_linkedin_posts").select("*").eq("primary_company_id", entityId).order("posted_at", { ascending: false }).limit(50),
          supabase.from("primary_company_instagram_posts").select("*").eq("primary_company_id", entityId).order("timestamp", { ascending: false }).limit(50),
          supabase.from("primary_company_youtube_videos").select("*").eq("primary_company_id", entityId).order("published_at", { ascending: false }).limit(50),
        ]);
        glassdoorData = results[0].data;
        marketData = results[1].data;
        similarCompaniesData = results[2].data || [];
        marketNewsData = results[3].data || [];
        leadershipData = results[4].data || [];
        linkedinPosts = results[5].data || [];
        instagramPosts = results[6].data || [];
        youtubeVideos = results[7].data || [];
      }

      setData({
        entity: entityData,
        glassdoor: glassdoorData,
        marketResearch: marketData,
        similarCompanies: similarCompaniesData,
        marketNews: marketNewsData,
        leadership: leadershipData,
        socialPosts: {
          linkedin: linkedinPosts,
          instagram: instagramPosts,
          youtube: youtubeVideos,
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
