import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EntityType } from "@/contexts/AnalysisContext";

export interface SaveCompetitorData {
  webhookData: {
    overview: any;
    redes_sociais: any;
    glassdoor?: any;
    mercado: any;
  };
  domain: string;
  entityType?: EntityType;
}

const entityLabels: Record<EntityType, { singular: string; table: string; glassdoorTable: string; glassdoorFk: string }> = {
  competitor: { singular: 'concorrente', table: 'companies', glassdoorTable: 'glassdoor_summary', glassdoorFk: 'company_id' },
  prospect: { singular: 'prospect', table: 'prospects', glassdoorTable: 'prospect_glassdoor_summary', glassdoorFk: 'prospect_id' },
  client: { singular: 'cliente', table: 'clients', glassdoorTable: 'client_glassdoor_summary', glassdoorFk: 'client_id' },
  primary: { singular: 'empresa principal', table: 'primary_company', glassdoorTable: 'primary_company_glassdoor', glassdoorFk: 'primary_company_id' },
};

export function useSaveCompetitor() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveCompetitor = async ({ webhookData, domain, entityType = 'competitor' }: SaveCompetitorData): Promise<boolean> => {
    try {
      setIsSaving(true);
      const labels = entityLabels[entityType];
      console.log(`Starting to save ${labels.singular} data for:`, domain);

      const { overview, redes_sociais, mercado } = webhookData;
      const glassdoor = redes_sociais?.glassdoor || webhookData.glassdoor;

      if (!overview) {
        throw new Error("Overview data is missing from webhook payload");
      }

      // 1. Upsert entity data
      const entityRecord: Record<string, any> = {
        domain: domain,
        name: overview.nome || null,
        description: overview.descricao_institucional || null,
        industry: overview.setor || null,
        sector: overview.setor || null,
        logo_url: overview.logo_url || null,
        address: overview.endereco || null,
        phone: overview.telefone || null,
        market: Array.isArray(overview.mercado_alvo) 
          ? overview.mercado_alvo.join(", ") 
          : overview.mercado_alvo || null,
        business_model: overview.modelo_negocio || null,
        products_services: overview.produtos_servicos || null,
        differentiators: overview.diferenciais || null,
        partners: overview.parceiros || null,
        clients: overview.clientes_citados || overview.clientes_citados_publicamente || null,
        website: overview.website || 
                 overview.site_institucional || 
                 overview?.positioning?.presenca_digital?.site_institucional || 
                 overview?.positioning?.site_institucional ||
                 `https://${domain}`,
        headquarters: redes_sociais?.linkedin?.headquarters || overview.endereco || null,
        year_founded: redes_sociais?.linkedin?.founded
          ? parseInt(redes_sociais.linkedin.founded)
          : null,
        size: redes_sociais?.linkedin?.company_size || null,
        employee_count: redes_sociais?.linkedin?.employee_count || null,
        linkedin_url: redes_sociais?.linkedin?.url || null,
        linkedin_followers: redes_sociais?.linkedin?.followers || null,
        linkedin_specialties: redes_sociais?.linkedin?.specialties || null,
        linkedin_tagline: redes_sociais?.linkedin?.tagline || null,
        instagram_url: redes_sociais?.instagram?.profileUrl || null,
        instagram_username: redes_sociais?.instagram?.username || null,
        instagram_followers: redes_sociais?.instagram?.profile?.followersCount || null,
        instagram_follows: redes_sociais?.instagram?.profile?.followsCount || null,
        instagram_posts_count: redes_sociais?.instagram?.profile?.postsCount || null,
        youtube_url: redes_sociais?.youtube?.channel?.url || redes_sociais?.youtube?.channel_url || null,
        youtube_channel_name: redes_sociais?.youtube?.channel?.name || redes_sociais?.youtube?.channel_name || null,
        youtube_subscribers: redes_sociais?.youtube?.channel?.subscribers || redes_sociais?.youtube?.subscriber_count || null,
        youtube_total_videos: redes_sociais?.youtube?.channel?.totalVideos || redes_sociais?.youtube?.total_videos || null,
        youtube_total_views: redes_sociais?.youtube?.channel?.totalViews || redes_sociais?.youtube?.total_views || null,
      };

      let entityId: string;

      // Handle different entity types with explicit table references
      if (entityType === 'competitor') {
        const { data: existing } = await supabase.from("companies").select("id").eq("domain", domain).maybeSingle();
        if (existing) {
          await supabase.from("companies").update(entityRecord as any).eq("id", existing.id);
          entityId = existing.id;
        } else {
          const { data: newEntity, error } = await supabase.from("companies").insert(entityRecord as any).select("id").single();
          if (error) throw error;
          entityId = newEntity.id;
        }
      } else if (entityType === 'prospect') {
        const { data: existing } = await supabase.from("prospects").select("id").eq("domain", domain).maybeSingle();
        if (existing) {
          await supabase.from("prospects").update(entityRecord as any).eq("id", existing.id);
          entityId = existing.id;
        } else {
          const { data: newEntity, error } = await supabase.from("prospects").insert(entityRecord as any).select("id").single();
          if (error) throw error;
          entityId = newEntity.id;
        }
      } else if (entityType === 'client') {
        const { data: existing } = await supabase.from("clients").select("id").eq("domain", domain).maybeSingle();
        if (existing) {
          await supabase.from("clients").update(entityRecord as any).eq("id", existing.id);
          entityId = existing.id;
        } else {
          const { data: newEntity, error } = await supabase.from("clients").insert(entityRecord as any).select("id").single();
          if (error) throw error;
          entityId = newEntity.id;
        }
      } else if (entityType === 'primary') {
        // Primary company uses user_id, need to get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        const primaryRecord = {
          ...entityRecord,
          user_id: user.id,
          analyzed_at: new Date().toISOString(),
        };
        
        console.log("=== SAVING PRIMARY COMPANY ===");
        console.log("Primary record:", JSON.stringify(primaryRecord, null, 2));
        
        const { data: existing } = await supabase.from("primary_company").select("id").eq("user_id", user.id).maybeSingle();
        
        if (existing) {
          console.log("Updating existing primary company:", existing.id);
          const { error: updateError } = await supabase
            .from("primary_company")
            .update(primaryRecord as any)
            .eq("id", existing.id);
          
          if (updateError) {
            console.error("Error updating primary company:", updateError);
            throw updateError;
          }
          entityId = existing.id;
          console.log("Primary company updated successfully");
        } else {
          console.log("Inserting new primary company");
          const { data: newEntity, error } = await supabase
            .from("primary_company")
            .insert(primaryRecord as any)
            .select("id")
            .single();
          
          if (error) {
            console.error("Error inserting primary company:", error);
            throw error;
          }
          entityId = newEntity.id;
          console.log("Primary company inserted successfully");
        }
        
        console.log("Primary company saved with ID:", entityId);
        console.log("=== END SAVING PRIMARY COMPANY ===");
      } else {
        throw new Error(`Unknown entity type: ${entityType}`);
      }

      console.log("Entity saved with ID:", entityId);

      // Save related data for ALL entity types
      if (entityType === 'competitor') {
        await saveCompetitorRelatedData(entityId, redes_sociais, overview, mercado);
      } else if (entityType === 'client') {
        await saveClientRelatedData(entityId, redes_sociais, overview, mercado);
      } else if (entityType === 'prospect') {
        await saveProspectRelatedData(entityId, redes_sociais, overview, mercado);
      } else if (entityType === 'primary') {
        await savePrimaryCompanyRelatedData(entityId, redes_sociais, overview, mercado);
      }

      // Save Glassdoor data for all entity types
      if (glassdoor && (glassdoor.overall_rating || glassdoor.rating)) {
        try {
          const glassdoorBase = {
            overall_rating: glassdoor.overall_rating ?? glassdoor.rating ?? null,
            compensation_benefits_rating: glassdoor.compensation_benefits_rating ?? null,
            culture_values_rating: glassdoor.culture_values_rating ?? null,
            career_opportunities_rating: glassdoor.career_opportunities_rating ?? null,
            work_life_balance_rating: glassdoor.work_life_balance_rating ?? null,
            diversity_inclusion_rating: glassdoor.diversity_inclusion_rating ?? null,
            recommend_to_friend: glassdoor.recommend_to_friend ?? null,
            ceo_rating: glassdoor.ceo_rating >= 0 ? glassdoor.ceo_rating : null,
            pros_example: glassdoor.pros_example ?? null,
            cons_example: glassdoor.cons_example ?? null,
            advice_example: glassdoor.advice_example ?? null,
            reviews: glassdoor.reviews || [],
            salaries: glassdoor.salaries || [],
            benefits: glassdoor.benefits || [],
            interviews: glassdoor.interviews || [],
          };

          if (entityType === 'competitor') {
            await supabase.from("glassdoor_summary").delete().eq("company_id", entityId);
            await supabase.from("glassdoor_summary").insert({ company_id: entityId, ...glassdoorBase });
            console.log("Inserted Glassdoor data for competitor");
          } else if (entityType === 'prospect') {
            await supabase.from("prospect_glassdoor_summary").delete().eq("prospect_id", entityId);
            await supabase.from("prospect_glassdoor_summary").insert({ prospect_id: entityId, ...glassdoorBase });
            console.log("Inserted Glassdoor data for prospect");
          } else if (entityType === 'client') {
            await supabase.from("client_glassdoor_summary").delete().eq("client_id", entityId);
            await supabase.from("client_glassdoor_summary").insert({ client_id: entityId, ...glassdoorBase });
            console.log("Inserted Glassdoor data for client");
          } else if (entityType === 'primary') {
            await supabase.from("primary_company_glassdoor").delete().eq("primary_company_id", entityId);
            await supabase.from("primary_company_glassdoor").insert({ primary_company_id: entityId, ...glassdoorBase });
            console.log("Inserted Glassdoor data for primary company");
          }
        } catch (error) {
          console.error("Failed to process Glassdoor data:", error);
        }
      }

      toast({
        title: "Sucesso!",
        description: `Dados do ${labels.singular} salvos com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error("Error saving entity:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar dados",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Save related data for COMPETITORS
  const saveCompetitorRelatedData = async (
    companyId: string,
    redes_sociais: any,
    overview: any,
    mercado: any
  ) => {
    // LinkedIn posts
    if (redes_sociais?.linkedin?.posts?.length > 0) {
      try {
        await supabase.from("linkedin_posts").delete().eq("company_id", companyId);
        const posts = redes_sociais.linkedin.posts.map((post: any) => ({
          company_id: companyId,
          external_id: post.id || null,
          text: post.text || null,
          post_type: post.post_type || null,
          posted_at: post.posted_at || null,
          total_reactions: post.stats?.total_reactions || 0,
          likes: post.stats?.like || 0,
          loves: post.stats?.love || 0,
          celebrates: post.stats?.celebrate || 0,
          reposts: post.stats?.reposts || 0,
          comments: post.stats?.comments || 0,
          media_type: post.media?.type || null,
          media_url: post.media?.url || null,
          media_thumbnail: post.media?.thumbnail || null,
          media_duration_ms: post.media?.duration || null,
        }));
        await supabase.from("linkedin_posts").insert(posts);
        console.log(`Inserted ${posts.length} LinkedIn posts`);
      } catch (error) {
        console.error("Failed to process LinkedIn posts:", error);
      }
    }

    // Instagram posts
    if (redes_sociais?.instagram?.posts?.length > 0) {
      try {
        await supabase.from("instagram_posts").delete().eq("company_id", companyId);
        const posts = redes_sociais.instagram.posts.map((post: any) => ({
          company_id: companyId,
          external_id: post.id || null,
          caption: post.caption || null,
          url: post.url || null,
          media_type: post.mediaType || null,
          media_url: post.mediaUrl || null,
          thumbnail_url: post.thumbnailUrl || null,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          shares_count: post.sharesCount || 0,
          timestamp: post.timestamp || null,
          mentions: Array.isArray(post.mentions) ? post.mentions.join(", ") : null,
          hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(", ") : null,
        }));
        await supabase.from("instagram_posts").insert(posts);
        console.log(`Inserted ${posts.length} Instagram posts`);
      } catch (error) {
        console.error("Failed to process Instagram posts:", error);
      }
    }

    // YouTube videos
    if (redes_sociais?.youtube?.videos?.length > 0) {
      try {
        await supabase.from("youtube_videos").delete().eq("company_id", companyId);
        const videos = redes_sociais.youtube.videos.map((video: any) => ({
          company_id: companyId,
          external_id: video.id || null,
          title: video.title || null,
          url: video.url || null,
          thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
          view_count: video.viewCount || video.views || 0,
          likes: video.likes || 0,
          comments_count: video.commentsCount || video.comments || 0,
          published_at: video.publishedAt || video.published_at || null,
        }));
        await supabase.from("youtube_videos").insert(videos);
        console.log(`Inserted ${videos.length} YouTube videos`);
      } catch (error) {
        console.error("Failed to process YouTube videos:", error);
      }
    }

    // Leadership
    if (overview?.lideranca?.length > 0) {
      try {
        await supabase.from("company_leadership").delete().eq("company_id", companyId);
        const leadership = overview.lideranca.map((leader: any) => ({
          company_id: companyId,
          name: leader.nome || null,
          position: leader.cargo || null,
          linkedin_url: leader.linkedin || null,
          source: leader.url_fonte || null,
        }));
        await supabase.from("company_leadership").insert(leadership);
        console.log(`Inserted ${leadership.length} leadership records`);
      } catch (error) {
        console.error("Failed to process leadership:", error);
      }
    }

    // Market Research
    try {
      await supabase.from("market_research").delete().eq("company_id", companyId);
      const marketResearch = {
        company_id: companyId,
        institutional_discourse: overview?.positioning?.discurso_institucional || null,
        recurring_topics: overview?.positioning?.topicos_recorrentes || null,
        digital_presence: overview?.positioning?.presenca_digital || null,
        public_actions: overview?.positioning?.acoes_publicas || null,
        institutional_curiosities: overview?.curiosidades_institucionais || null,
        strategic_analysis: overview?.overall_analysis || null,
        swot_analysis: mercado?.analises || null,
        events: mercado?.eventos || [],
        source_references: Array.isArray(overview?.references) ? overview.references.join(", ") : overview?.references || null,
      };
      await supabase.from("market_research").insert(marketResearch);
      console.log("Inserted market research data");
    } catch (error) {
      console.error("Failed to process market research:", error);
    }

    // Market News
    if (mercado?.news_and_actions?.length > 0) {
      try {
        await supabase.from("market_news").delete().eq("company_id", companyId);
        const news = mercado.news_and_actions.map((n: any) => ({
          company_id: companyId,
          title: n.titulo || null,
          url: n.url || null,
          date: n.data || null,
          summary: n.resumo || null,
          classification: n.tipo || n.classificacao || null,
        }));
        await supabase.from("market_news").insert(news);
        console.log(`Inserted ${news.length} news records`);
      } catch (error) {
        console.error("Failed to process market news:", error);
      }
    }

    // Public actions as news
    if (overview?.positioning?.acoes_publicas?.length > 0) {
      try {
        const actions = overview.positioning.acoes_publicas.map((action: any) => ({
          company_id: companyId,
          title: action.titulo || null,
          url: action.url || null,
          date: action.data || null,
          summary: action.resumo || null,
          classification: action.tipo || "acao_publica",
        }));
        await supabase.from("market_news").insert(actions);
        console.log(`Inserted ${actions.length} public actions`);
      } catch (error) {
        console.error("Failed to process public actions:", error);
      }
    }

    // Similar Companies
    if (overview?.similar_companies?.length > 0 || mercado?.similar_companies?.length > 0) {
      try {
        await supabase.from("similar_companies").delete().eq("company_id", companyId);
        const allSimilar: any[] = [];
        if (overview?.similar_companies?.length > 0) {
          overview.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              company_id: companyId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "overview",
            });
          });
        }
        if (mercado?.similar_companies?.length > 0) {
          mercado.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              company_id: companyId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "mercado",
            });
          });
        }
        if (allSimilar.length > 0) {
          await supabase.from("similar_companies").insert(allSimilar);
          console.log(`Inserted ${allSimilar.length} similar companies`);
        }
      } catch (error) {
        console.error("Failed to process similar companies:", error);
      }
    }
  };

  // Save related data for CLIENTS
  const saveClientRelatedData = async (
    clientId: string,
    redes_sociais: any,
    overview: any,
    mercado: any
  ) => {
    // LinkedIn posts
    if (redes_sociais?.linkedin?.posts?.length > 0) {
      try {
        await supabase.from("client_linkedin_posts").delete().eq("client_id", clientId);
        const posts = redes_sociais.linkedin.posts.map((post: any) => ({
          client_id: clientId,
          external_id: post.id || null,
          text: post.text || null,
          post_type: post.post_type || null,
          posted_at: post.posted_at || null,
          total_reactions: post.stats?.total_reactions || 0,
          likes: post.stats?.like || 0,
          loves: post.stats?.love || 0,
          celebrates: post.stats?.celebrate || 0,
          reposts: post.stats?.reposts || 0,
          comments: post.stats?.comments || 0,
          media_type: post.media?.type || null,
          media_url: post.media?.url || null,
          media_thumbnail: post.media?.thumbnail || null,
          media_duration_ms: post.media?.duration || null,
        }));
        await supabase.from("client_linkedin_posts").insert(posts);
        console.log(`Inserted ${posts.length} client LinkedIn posts`);
      } catch (error) {
        console.error("Failed to process client LinkedIn posts:", error);
      }
    }

    // Instagram posts
    if (redes_sociais?.instagram?.posts?.length > 0) {
      try {
        await supabase.from("client_instagram_posts").delete().eq("client_id", clientId);
        const posts = redes_sociais.instagram.posts.map((post: any) => ({
          client_id: clientId,
          external_id: post.id || null,
          caption: post.caption || null,
          url: post.url || null,
          media_type: post.mediaType || null,
          media_url: post.mediaUrl || null,
          thumbnail_url: post.thumbnailUrl || null,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          shares_count: post.sharesCount || 0,
          timestamp: post.timestamp || null,
          mentions: Array.isArray(post.mentions) ? post.mentions.join(", ") : null,
          hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(", ") : null,
        }));
        await supabase.from("client_instagram_posts").insert(posts);
        console.log(`Inserted ${posts.length} client Instagram posts`);
      } catch (error) {
        console.error("Failed to process client Instagram posts:", error);
      }
    }

    // YouTube videos
    if (redes_sociais?.youtube?.videos?.length > 0) {
      try {
        await supabase.from("client_youtube_videos").delete().eq("client_id", clientId);
        const videos = redes_sociais.youtube.videos.map((video: any) => ({
          client_id: clientId,
          external_id: video.id || null,
          title: video.title || null,
          url: video.url || null,
          thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
          view_count: video.viewCount || video.views || 0,
          likes: video.likes || 0,
          comments_count: video.commentsCount || video.comments || 0,
          published_at: video.publishedAt || video.published_at || null,
        }));
        await supabase.from("client_youtube_videos").insert(videos);
        console.log(`Inserted ${videos.length} client YouTube videos`);
      } catch (error) {
        console.error("Failed to process client YouTube videos:", error);
      }
    }

    // Leadership
    if (overview?.lideranca?.length > 0) {
      try {
        await supabase.from("client_leadership").delete().eq("client_id", clientId);
        const leadership = overview.lideranca.map((leader: any) => ({
          client_id: clientId,
          name: leader.nome || null,
          position: leader.cargo || null,
          linkedin_url: leader.linkedin || null,
          source: leader.url_fonte || null,
        }));
        await supabase.from("client_leadership").insert(leadership);
        console.log(`Inserted ${leadership.length} client leadership records`);
      } catch (error) {
        console.error("Failed to process client leadership:", error);
      }
    }

    // Market Research
    try {
      await supabase.from("client_market_research").delete().eq("client_id", clientId);
      const marketResearch = {
        client_id: clientId,
        institutional_discourse: overview?.positioning?.discurso_institucional || null,
        recurring_topics: overview?.positioning?.topicos_recorrentes || null,
        digital_presence: overview?.positioning?.presenca_digital || null,
        public_actions: overview?.positioning?.acoes_publicas || null,
        institutional_curiosities: overview?.curiosidades_institucionais || null,
        strategic_analysis: overview?.overall_analysis || null,
        swot_analysis: mercado?.analises || null,
        events: mercado?.eventos || [],
        source_references: Array.isArray(overview?.references) ? overview.references.join(", ") : overview?.references || null,
      };
      await supabase.from("client_market_research").insert(marketResearch);
      console.log("Inserted client market research data");
    } catch (error) {
      console.error("Failed to process client market research:", error);
    }

    // Market News
    if (mercado?.news_and_actions?.length > 0) {
      try {
        await supabase.from("client_market_news").delete().eq("client_id", clientId);
        const news = mercado.news_and_actions.map((n: any) => ({
          client_id: clientId,
          title: n.titulo || null,
          url: n.url || null,
          date: n.data || null,
          summary: n.resumo || null,
          classification: n.tipo || n.classificacao || null,
        }));
        await supabase.from("client_market_news").insert(news);
        console.log(`Inserted ${news.length} client news records`);
      } catch (error) {
        console.error("Failed to process client market news:", error);
      }
    }

    // Public actions as news
    if (overview?.positioning?.acoes_publicas?.length > 0) {
      try {
        const actions = overview.positioning.acoes_publicas.map((action: any) => ({
          client_id: clientId,
          title: action.titulo || null,
          url: action.url || null,
          date: action.data || null,
          summary: action.resumo || null,
          classification: action.tipo || "acao_publica",
        }));
        await supabase.from("client_market_news").insert(actions);
        console.log(`Inserted ${actions.length} client public actions`);
      } catch (error) {
        console.error("Failed to process client public actions:", error);
      }
    }

    // Similar Companies
    if (overview?.similar_companies?.length > 0 || mercado?.similar_companies?.length > 0) {
      try {
        await supabase.from("client_similar_companies").delete().eq("client_id", clientId);
        const allSimilar: any[] = [];
        if (overview?.similar_companies?.length > 0) {
          overview.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              client_id: clientId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "overview",
            });
          });
        }
        if (mercado?.similar_companies?.length > 0) {
          mercado.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              client_id: clientId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "mercado",
            });
          });
        }
        if (allSimilar.length > 0) {
          await supabase.from("client_similar_companies").insert(allSimilar);
          console.log(`Inserted ${allSimilar.length} client similar companies`);
        }
      } catch (error) {
        console.error("Failed to process client similar companies:", error);
      }
    }
  };

  // Save related data for PROSPECTS
  const saveProspectRelatedData = async (
    prospectId: string,
    redes_sociais: any,
    overview: any,
    mercado: any
  ) => {
    // LinkedIn posts
    if (redes_sociais?.linkedin?.posts?.length > 0) {
      try {
        await supabase.from("prospect_linkedin_posts").delete().eq("prospect_id", prospectId);
        const posts = redes_sociais.linkedin.posts.map((post: any) => ({
          prospect_id: prospectId,
          external_id: post.id || null,
          text: post.text || null,
          post_type: post.post_type || null,
          posted_at: post.posted_at || null,
          total_reactions: post.stats?.total_reactions || 0,
          likes: post.stats?.like || 0,
          loves: post.stats?.love || 0,
          celebrates: post.stats?.celebrate || 0,
          reposts: post.stats?.reposts || 0,
          comments: post.stats?.comments || 0,
          media_type: post.media?.type || null,
          media_url: post.media?.url || null,
          media_thumbnail: post.media?.thumbnail || null,
          media_duration_ms: post.media?.duration || null,
        }));
        await supabase.from("prospect_linkedin_posts").insert(posts);
        console.log(`Inserted ${posts.length} prospect LinkedIn posts`);
      } catch (error) {
        console.error("Failed to process prospect LinkedIn posts:", error);
      }
    }

    // Instagram posts
    if (redes_sociais?.instagram?.posts?.length > 0) {
      try {
        await supabase.from("prospect_instagram_posts").delete().eq("prospect_id", prospectId);
        const posts = redes_sociais.instagram.posts.map((post: any) => ({
          prospect_id: prospectId,
          external_id: post.id || null,
          caption: post.caption || null,
          url: post.url || null,
          media_type: post.mediaType || null,
          media_url: post.mediaUrl || null,
          thumbnail_url: post.thumbnailUrl || null,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          shares_count: post.sharesCount || 0,
          timestamp: post.timestamp || null,
          mentions: Array.isArray(post.mentions) ? post.mentions.join(", ") : null,
          hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(", ") : null,
        }));
        await supabase.from("prospect_instagram_posts").insert(posts);
        console.log(`Inserted ${posts.length} prospect Instagram posts`);
      } catch (error) {
        console.error("Failed to process prospect Instagram posts:", error);
      }
    }

    // YouTube videos
    if (redes_sociais?.youtube?.videos?.length > 0) {
      try {
        await supabase.from("prospect_youtube_videos").delete().eq("prospect_id", prospectId);
        const videos = redes_sociais.youtube.videos.map((video: any) => ({
          prospect_id: prospectId,
          external_id: video.id || null,
          title: video.title || null,
          url: video.url || null,
          thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
          view_count: video.viewCount || video.views || 0,
          likes: video.likes || 0,
          comments_count: video.commentsCount || video.comments || 0,
          published_at: video.publishedAt || video.published_at || null,
        }));
        await supabase.from("prospect_youtube_videos").insert(videos);
        console.log(`Inserted ${videos.length} prospect YouTube videos`);
      } catch (error) {
        console.error("Failed to process prospect YouTube videos:", error);
      }
    }

    // Leadership
    if (overview?.lideranca?.length > 0) {
      try {
        await supabase.from("prospect_leadership").delete().eq("prospect_id", prospectId);
        const leadership = overview.lideranca.map((leader: any) => ({
          prospect_id: prospectId,
          name: leader.nome || null,
          position: leader.cargo || null,
          linkedin_url: leader.linkedin || null,
          source: leader.url_fonte || null,
        }));
        await supabase.from("prospect_leadership").insert(leadership);
        console.log(`Inserted ${leadership.length} prospect leadership records`);
      } catch (error) {
        console.error("Failed to process prospect leadership:", error);
      }
    }

    // Market Research
    try {
      await supabase.from("prospect_market_research").delete().eq("prospect_id", prospectId);
      const marketResearch = {
        prospect_id: prospectId,
        institutional_discourse: overview?.positioning?.discurso_institucional || null,
        recurring_topics: overview?.positioning?.topicos_recorrentes || null,
        digital_presence: overview?.positioning?.presenca_digital || null,
        public_actions: overview?.positioning?.acoes_publicas || null,
        institutional_curiosities: overview?.curiosidades_institucionais || null,
        strategic_analysis: overview?.overall_analysis || null,
        swot_analysis: mercado?.analises || null,
        events: mercado?.eventos || [],
        source_references: Array.isArray(overview?.references) ? overview.references.join(", ") : overview?.references || null,
      };
      await supabase.from("prospect_market_research").insert(marketResearch);
      console.log("Inserted prospect market research data");
    } catch (error) {
      console.error("Failed to process prospect market research:", error);
    }

    // Market News
    if (mercado?.news_and_actions?.length > 0) {
      try {
        await supabase.from("prospect_market_news").delete().eq("prospect_id", prospectId);
        const news = mercado.news_and_actions.map((n: any) => ({
          prospect_id: prospectId,
          title: n.titulo || null,
          url: n.url || null,
          date: n.data || null,
          summary: n.resumo || null,
          classification: n.tipo || n.classificacao || null,
        }));
        await supabase.from("prospect_market_news").insert(news);
        console.log(`Inserted ${news.length} prospect news records`);
      } catch (error) {
        console.error("Failed to process prospect market news:", error);
      }
    }

    // Public actions as news
    if (overview?.positioning?.acoes_publicas?.length > 0) {
      try {
        const actions = overview.positioning.acoes_publicas.map((action: any) => ({
          prospect_id: prospectId,
          title: action.titulo || null,
          url: action.url || null,
          date: action.data || null,
          summary: action.resumo || null,
          classification: action.tipo || "acao_publica",
        }));
        await supabase.from("prospect_market_news").insert(actions);
        console.log(`Inserted ${actions.length} prospect public actions`);
      } catch (error) {
        console.error("Failed to process prospect public actions:", error);
      }
    }

    // Similar Companies
    if (overview?.similar_companies?.length > 0 || mercado?.similar_companies?.length > 0) {
      try {
        await supabase.from("prospect_similar_companies").delete().eq("prospect_id", prospectId);
        const allSimilar: any[] = [];
        if (overview?.similar_companies?.length > 0) {
          overview.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              prospect_id: prospectId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "overview",
            });
          });
        }
        if (mercado?.similar_companies?.length > 0) {
          mercado.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              prospect_id: prospectId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "mercado",
            });
          });
        }
        if (allSimilar.length > 0) {
          await supabase.from("prospect_similar_companies").insert(allSimilar);
          console.log(`Inserted ${allSimilar.length} prospect similar companies`);
        }
      } catch (error) {
        console.error("Failed to process prospect similar companies:", error);
      }
    }
  };

  // Save related data for PRIMARY COMPANY
  const savePrimaryCompanyRelatedData = async (
    primaryCompanyId: string,
    redes_sociais: any,
    overview: any,
    mercado: any
  ) => {
    // LinkedIn posts
    if (redes_sociais?.linkedin?.posts?.length > 0) {
      try {
        await supabase.from("primary_company_linkedin_posts").delete().eq("primary_company_id", primaryCompanyId);
        const posts = redes_sociais.linkedin.posts.map((post: any) => ({
          primary_company_id: primaryCompanyId,
          external_id: post.id || null,
          text: post.text || null,
          post_type: post.post_type || null,
          posted_at: post.posted_at || null,
          total_reactions: post.stats?.total_reactions || 0,
          likes: post.stats?.like || 0,
          loves: post.stats?.love || 0,
          celebrates: post.stats?.celebrate || 0,
          reposts: post.stats?.reposts || 0,
          comments: post.stats?.comments || 0,
          media_type: post.media?.type || null,
          media_url: post.media?.url || null,
          media_thumbnail: post.media?.thumbnail || null,
          media_duration_ms: post.media?.duration || null,
        }));
        await supabase.from("primary_company_linkedin_posts").insert(posts);
        console.log(`Inserted ${posts.length} primary company LinkedIn posts`);
      } catch (error) {
        console.error("Failed to process primary company LinkedIn posts:", error);
      }
    }

    // Instagram posts
    if (redes_sociais?.instagram?.posts?.length > 0) {
      try {
        await supabase.from("primary_company_instagram_posts").delete().eq("primary_company_id", primaryCompanyId);
        const posts = redes_sociais.instagram.posts.map((post: any) => ({
          primary_company_id: primaryCompanyId,
          external_id: post.id || null,
          caption: post.caption || null,
          url: post.url || null,
          media_type: post.mediaType || null,
          media_url: post.mediaUrl || null,
          thumbnail_url: post.thumbnailUrl || null,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          shares_count: post.sharesCount || 0,
          timestamp: post.timestamp || null,
          mentions: Array.isArray(post.mentions) ? post.mentions.join(", ") : null,
          hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(", ") : null,
        }));
        await supabase.from("primary_company_instagram_posts").insert(posts);
        console.log(`Inserted ${posts.length} primary company Instagram posts`);
      } catch (error) {
        console.error("Failed to process primary company Instagram posts:", error);
      }
    }

    // YouTube videos
    if (redes_sociais?.youtube?.videos?.length > 0) {
      try {
        await supabase.from("primary_company_youtube_videos").delete().eq("primary_company_id", primaryCompanyId);
        const videos = redes_sociais.youtube.videos.map((video: any) => ({
          primary_company_id: primaryCompanyId,
          external_id: video.id || null,
          title: video.title || null,
          url: video.url || null,
          thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
          view_count: video.viewCount || video.views || 0,
          likes: video.likes || 0,
          comments_count: video.commentsCount || video.comments || 0,
          published_at: video.publishedAt || video.published_at || null,
        }));
        await supabase.from("primary_company_youtube_videos").insert(videos);
        console.log(`Inserted ${videos.length} primary company YouTube videos`);
      } catch (error) {
        console.error("Failed to process primary company YouTube videos:", error);
      }
    }

    // Leadership
    if (overview?.lideranca?.length > 0) {
      try {
        await supabase.from("primary_company_leadership").delete().eq("primary_company_id", primaryCompanyId);
        const leadership = overview.lideranca.map((leader: any) => ({
          primary_company_id: primaryCompanyId,
          name: leader.nome || null,
          position: leader.cargo || null,
          linkedin_url: leader.linkedin || null,
          source: leader.url_fonte || null,
        }));
        await supabase.from("primary_company_leadership").insert(leadership);
        console.log(`Inserted ${leadership.length} primary company leadership records`);
      } catch (error) {
        console.error("Failed to process primary company leadership:", error);
      }
    }

    // Market Research
    try {
      await supabase.from("primary_company_market_research").delete().eq("primary_company_id", primaryCompanyId);
      const marketResearch = {
        primary_company_id: primaryCompanyId,
        institutional_discourse: overview?.positioning?.discurso_institucional || null,
        recurring_topics: overview?.positioning?.topicos_recorrentes || null,
        digital_presence: overview?.positioning?.presenca_digital || null,
        public_actions: overview?.positioning?.acoes_publicas || null,
        institutional_curiosities: overview?.curiosidades_institucionais || null,
        strategic_analysis: overview?.overall_analysis || null,
        swot_analysis: mercado?.analises || null,
        events: mercado?.eventos || [],
        source_references: Array.isArray(overview?.references) ? overview.references.join(", ") : overview?.references || null,
      };
      await supabase.from("primary_company_market_research").insert(marketResearch);
      console.log("Inserted primary company market research data");
    } catch (error) {
      console.error("Failed to process primary company market research:", error);
    }

    // Market News
    if (mercado?.news_and_actions?.length > 0) {
      try {
        await supabase.from("primary_company_market_news").delete().eq("primary_company_id", primaryCompanyId);
        const news = mercado.news_and_actions.map((n: any) => ({
          primary_company_id: primaryCompanyId,
          title: n.titulo || null,
          url: n.url || null,
          date: n.data || null,
          summary: n.resumo || null,
          classification: n.tipo || n.classificacao || null,
        }));
        await supabase.from("primary_company_market_news").insert(news);
        console.log(`Inserted ${news.length} primary company news records`);
      } catch (error) {
        console.error("Failed to process primary company market news:", error);
      }
    }

    // Public actions as news
    if (overview?.positioning?.acoes_publicas?.length > 0) {
      try {
        const actions = overview.positioning.acoes_publicas.map((action: any) => ({
          primary_company_id: primaryCompanyId,
          title: action.titulo || null,
          url: action.url || null,
          date: action.data || null,
          summary: action.resumo || null,
          classification: action.tipo || "acao_publica",
        }));
        await supabase.from("primary_company_market_news").insert(actions);
        console.log(`Inserted ${actions.length} primary company public actions`);
      } catch (error) {
        console.error("Failed to process primary company public actions:", error);
      }
    }

    // Similar Companies
    if (overview?.similar_companies?.length > 0 || mercado?.similar_companies?.length > 0) {
      try {
        await supabase.from("primary_company_similar_companies").delete().eq("primary_company_id", primaryCompanyId);
        const allSimilar: any[] = [];
        if (overview?.similar_companies?.length > 0) {
          overview.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              primary_company_id: primaryCompanyId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "overview",
            });
          });
        }
        if (mercado?.similar_companies?.length > 0) {
          mercado.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              primary_company_id: primaryCompanyId,
              name: sc.name || null,
              industry: sc.industry || null,
              location: sc.location || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "mercado",
            });
          });
        }
        if (allSimilar.length > 0) {
          await supabase.from("primary_company_similar_companies").insert(allSimilar);
          console.log(`Inserted ${allSimilar.length} primary company similar companies`);
        }
      } catch (error) {
        console.error("Failed to process primary company similar companies:", error);
      }
    }

    // Glassdoor (handled separately in main function, but also save here if needed)
    const glassdoor = redes_sociais?.glassdoor;
    if (glassdoor && (glassdoor.overall_rating || glassdoor.rating)) {
      try {
        await supabase.from("primary_company_glassdoor").delete().eq("primary_company_id", primaryCompanyId);
        const glassdoorData = {
          primary_company_id: primaryCompanyId,
          overall_rating: glassdoor.overall_rating ?? glassdoor.rating ?? null,
          compensation_benefits_rating: glassdoor.compensation_benefits_rating ?? null,
          culture_values_rating: glassdoor.culture_values_rating ?? null,
          career_opportunities_rating: glassdoor.career_opportunities_rating ?? null,
          work_life_balance_rating: glassdoor.work_life_balance_rating ?? null,
          diversity_inclusion_rating: glassdoor.diversity_inclusion_rating ?? null,
          recommend_to_friend: glassdoor.recommend_to_friend ?? null,
          ceo_rating: glassdoor.ceo_rating >= 0 ? glassdoor.ceo_rating : null,
          pros_example: glassdoor.pros_example ?? null,
          cons_example: glassdoor.cons_example ?? null,
          advice_example: glassdoor.advice_example ?? null,
          reviews: glassdoor.reviews || [],
          salaries: glassdoor.salaries || [],
          benefits: glassdoor.benefits || [],
          interviews: glassdoor.interviews || [],
        };
        await supabase.from("primary_company_glassdoor").insert(glassdoorData);
        console.log("Inserted primary company Glassdoor data");
      } catch (error) {
        console.error("Failed to process primary company Glassdoor:", error);
      }
    }
  };

  return { saveCompetitor, isSaving };
}
