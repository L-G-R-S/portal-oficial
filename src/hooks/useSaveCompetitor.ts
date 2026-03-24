import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EntityType } from "@/contexts/AnalysisContext";

export interface SaveCompetitorData {
  webhookData: {
    overview?: any;
    redes_sociais?: any;
    glassdoor?: any;
    mercado?: any;
    linkedin_info?: any;
    linkedin_posts?: any;
    instagram_info?: any;
    instagram_posts?: any;
    youtube_info?: any;
    glassdoor_info?: any;
    blog_posts?: any;
    [key: string]: any;
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

type EntityConfig = {
  fkName: string;
  tables: {
    linkedin: string;
    instagram: string;
    youtube: string;
    leadership: string;
    marketResearch: string;
    marketNews: string;
    similarCompanies: string;
    blogPosts: string;
  }
};

const entityConfigs: Record<EntityType, EntityConfig> = {
  competitor: {
    fkName: 'company_id',
    tables: {
      linkedin: 'linkedin_posts',
      instagram: 'instagram_posts',
      youtube: 'youtube_videos',
      leadership: 'company_leadership',
      marketResearch: 'market_research',
      marketNews: 'market_news',
      similarCompanies: 'similar_companies',
      blogPosts: 'company_blog_posts',
    }
  },
  client: {
    fkName: 'client_id',
    tables: {
      linkedin: 'client_linkedin_posts',
      instagram: 'client_instagram_posts',
      youtube: 'client_youtube_videos',
      leadership: 'client_leadership',
      marketResearch: 'client_market_research',
      marketNews: 'client_market_news',
      similarCompanies: 'client_similar_companies',
      blogPosts: 'client_blog_posts',
    }
  },
  prospect: {
    fkName: 'prospect_id',
    tables: {
      linkedin: 'prospect_linkedin_posts',
      instagram: 'prospect_instagram_posts',
      youtube: 'prospect_youtube_videos',
      leadership: 'prospect_leadership',
      marketResearch: 'prospect_market_research',
      marketNews: 'prospect_market_news',
      similarCompanies: 'prospect_similar_companies',
      blogPosts: 'prospect_blog_posts',
    }
  },
  primary: {
    fkName: 'primary_company_id',
    tables: {
      linkedin: 'primary_company_linkedin_posts',
      instagram: 'primary_company_instagram_posts',
      youtube: 'primary_company_youtube_videos',
      leadership: 'primary_company_leadership',
      marketResearch: 'primary_company_market_research',
      marketNews: 'primary_company_market_news',
      similarCompanies: 'primary_company_similar_companies',
      blogPosts: 'primary_company_blog_posts',
    }
  }
};

const formatDateForSupabase = (dateStr: string | null | undefined): string | null => {
  if (!dateStr) return null;
  
  const brDateRegex = /^(\d{2})\/(\d{2})\/(\d{4})/;
  const match = dateStr.match(brDateRegex);
  if (match) {
    const [_, day, month, year] = match;
    const parsed = new Date(`${year}-${month}-${day}T12:00:00.000Z`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
  }
  
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export function useSaveCompetitor() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveRelatedData = async (
    entityId: string,
    entityType: EntityType,
    redes_sociais: any,
    overview: any,
    mercado: any,
    blog_posts?: any
  ) => {
    const config = entityConfigs[entityType];
    const { fkName, tables } = config;

    // LinkedIn posts
    if (redes_sociais?.linkedin?.posts?.length > 0) {
      try {
        await supabase.from(tables.linkedin).delete().eq(fkName, entityId);
        const posts = redes_sociais.linkedin.posts.map((post: any) => ({
          [fkName]: entityId,
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
        await supabase.from(tables.linkedin).insert(posts);
        console.log(`Inserted ${posts.length} LinkedIn posts for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process ${tables.linkedin}:`, error);
      }
    }

    // Instagram posts
    if (redes_sociais?.instagram?.posts?.length > 0) {
      try {
        await supabase.from(tables.instagram).delete().eq(fkName, entityId);
        const posts = redes_sociais.instagram.posts.map((post: any) => ({
          [fkName]: entityId,
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
        await supabase.from(tables.instagram).insert(posts);
        console.log(`Inserted ${posts.length} Instagram posts for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process ${tables.instagram}:`, error);
      }
    }

    // YouTube videos
    if (redes_sociais?.youtube?.videos?.length > 0) {
      try {
        await supabase.from(tables.youtube).delete().eq(fkName, entityId);
        const videos = redes_sociais.youtube.videos.map((video: any) => ({
          [fkName]: entityId,
          external_id: video.id || null,
          title: video.title || null,
          url: video.url || null,
          thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
          view_count: video.viewCount || video.views || 0,
          likes: video.likes || 0,
          comments_count: video.commentsCount || video.comments || 0,
          published_at: video.publishedAt || video.published_at || null,
        }));
        await supabase.from(tables.youtube).insert(videos);
        console.log(`Inserted ${videos.length} YouTube videos for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process ${tables.youtube}:`, error);
      }
    }

    const pessoas_chave = mercado?.company?.pessoas_chave || overview?.pessoas_chave || overview?.lideranca || [];
    if (pessoas_chave.length > 0) {
      try {
        await supabase.from(tables.leadership).delete().eq(fkName, entityId);
        const leadership = pessoas_chave.map((leader: any) => ({
          [fkName]: entityId,
          name: leader.nome || null,
          position: leader.cargo || null,
          linkedin_url: leader.linkedin || leader.linkedin_url || null,
          source: leader.url_fonte || leader.fonte_url || null,
        }));
        await supabase.from(tables.leadership).insert(leadership);
        console.log(`Inserted ${leadership.length} leadership records for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process ${tables.leadership}:`, error);
      }
    }

    // Market Research
    try {
      await supabase.from(tables.marketResearch).delete().eq(fkName, entityId);
      const marketResearch = {
        [fkName]: entityId,
        institutional_discourse: mercado?.positioning?.discurso_institucional || overview?.positioning?.discurso_institucional || null,
        recurring_topics: mercado?.positioning?.topicos_recorrentes || overview?.positioning?.topicos_recorrentes || null,
        digital_presence: mercado?.positioning?.presenca_digital || overview?.positioning?.presenca_digital || null,
        public_actions: mercado?.positioning?.acoes_publicas || overview?.positioning?.acoes_publicas || null,
        institutional_curiosities: mercado?.positioning?.curiosidades_institucionais || overview?.curiosidades_institucionais || null,
        overall_analysis: mercado?.strategic_analysis?.resumo_executivo || overview?.overall_analysis || null,
        swot_analysis: mercado?.analises || mercado?.strategic_analysis?.analise_swot || null,
        strategic_analysis: mercado?.strategic_analysis || null,
        events: mercado?.eventos || [],
        source_references: Array.isArray(mercado?.references) ? mercado.references.join(", ") : (Array.isArray(overview?.references) ? overview.references.join(", ") : overview?.references || null),
      };
      await supabase.from(tables.marketResearch).insert(marketResearch);
      console.log(`Inserted market research data for ${entityType}`);
    } catch (error) {
      console.error(`Failed to process ${tables.marketResearch}:`, error);
    }

    // Market News
    const newsData = mercado?.news_and_actions || mercado?.news_and_market_actions || mercado?.noticias || [];
    if (newsData.length > 0) {
      try {
        await supabase.from(tables.marketNews).delete().eq(fkName, entityId);
        const news = newsData.map((n: any) => ({
          [fkName]: entityId,
          title: n.title || n.titulo || null,
          url: n.url || null,
          date: formatDateForSupabase(n.date || n.data),
          summary: n.summary || n.resumo || null,
          classification: n.classification || n.tipo || n.classificacao || null,
        }));
        await supabase.from(tables.marketNews).insert(news);
        console.log(`Inserted ${news.length} news records for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process ${tables.marketNews}:`, error);
      }
    }

    // Public actions as news
    if (overview?.positioning?.acoes_publicas?.length > 0) {
      try {
        const actions = overview.positioning.acoes_publicas.map((action: any) => ({
          [fkName]: entityId,
          title: action.title || action.titulo || null,
          url: action.url || null,
          date: formatDateForSupabase(action.date || action.data),
          summary: action.summary || action.resumo || null,
          classification: action.classification || action.tipo || "acao_publica",
        }));
        await supabase.from(tables.marketNews).insert(actions);
        console.log(`Inserted ${actions.length} public actions for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process public actions for ${tables.marketNews}:`, error);
      }
    }

    // Similar Companies
    if (overview?.similar_companies?.length > 0 || mercado?.similar_companies?.length > 0) {
      try {
        await supabase.from(tables.similarCompanies).delete().eq(fkName, entityId);
        const allSimilar: any[] = [];
        if (overview?.similar_companies?.length > 0) {
          overview.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              [fkName]: entityId,
              name: sc.name || sc.nome || null,
              industry: sc.industry || sc.setor || null,
              location: sc.location || sc.localizacao || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "overview",
            });
          });
        }
        if (mercado?.similar_companies?.length > 0) {
          mercado.similar_companies.forEach((sc: any) => {
            allSimilar.push({
              [fkName]: entityId,
              name: sc.name || sc.nome || null,
              industry: sc.industry || sc.setor || null,
              location: sc.location || sc.localizacao || null,
              url: sc.url || null,
              logo_url: sc.logo_url || null,
              source: "mercado",
            });
          });
        }
        if (allSimilar.length > 0) {
          await supabase.from(tables.similarCompanies).insert(allSimilar);
          console.log(`Inserted ${allSimilar.length} similar companies for ${entityType}`);
        }
      } catch (error) {
        console.error(`Failed to process ${tables.similarCompanies}:`, error);
      }
    }

    // Blog Posts
    const blogPostsArray = Array.isArray(blog_posts) ? blog_posts : (blog_posts?.posts || []);
    if (blogPostsArray.length > 0) {
      try {
        await supabase.from(tables.blogPosts).delete().eq(fkName, entityId);
        const posts = blogPostsArray.map((post: any) => ({
          [fkName]: entityId,
          title: post.title || null,
          url: post.url || null,
          published_at: post.published_at || null,
          reading_time_minutes: post.reading_time_minutes || null,
          categories: Array.isArray(post.categories) ? post.categories.join(", ") : post.categories || null,
          cover_image_url: post.cover_image_url || null,
          author: post.author || null,
        }));
        await supabase.from(tables.blogPosts).insert(posts);
        console.log(`Inserted ${posts.length} blog posts for ${entityType}`);
      } catch (error) {
        console.error(`Failed to process ${tables.blogPosts}:`, error);
      }
    }
  };

  const saveCompetitor = async ({ webhookData, domain, entityType = 'competitor' }: SaveCompetitorData): Promise<boolean> => {
    try {
      setIsSaving(true);
      const labels = entityLabels[entityType];
      console.log(`Starting to save ${labels.singular} data for:`, domain);

      let actualData = Array.isArray(webhookData) ? webhookData[0] : (webhookData || {});
      if (actualData.json) actualData = actualData.json;
      const overview = actualData.company || actualData.linkedin_info || actualData.overview || {};
      const redes_sociais = actualData.redes_sociais || {
        linkedin: { posts: actualData.linkedin_posts },
        instagram: { posts: actualData.instagram_posts },
        youtube: actualData.youtube_info 
      };
      const mercado = actualData.mercado || actualData.market_research_raw || {};
      
      if (!mercado.similar_companies || mercado.similar_companies.length === 0) {
        mercado.similar_companies = actualData.similar_companies || actualData.linkedin_info?.similar_companies || overview.similar_companies || [];
      }
      if (!mercado.news_and_actions || mercado.news_and_actions.length === 0) {
        mercado.news_and_actions = mercado.news_and_market_actions || mercado.noticias || actualData.noticias || [];
      }

      const glassdoor = actualData.glassdoor_info || (redes_sociais?.glassdoor || actualData.glassdoor);
      const blog_posts = actualData.blog_posts || null;
      const mercadoCompany = mercado?.company || {};

      if (Object.keys(overview).length === 0) {
        throw new Error("Overview/Company data is missing from webhook payload");
      }

      // 1. Upsert entity data
      const entityRecord: Record<string, any> = {
        domain: domain,
        name: overview.nome || overview.name || null,
        description: overview.descricao_institucional || overview.description || null,
        industry: overview.setor || overview.industry || null,
        sector: overview.setor || overview.sector || null,
        logo_url: actualData.linkedin_logo || overview.logo_url || actualData.linkedin_info?.profile_pic_url || actualData.linkedin_info?.logoUrl || redes_sociais?.linkedin?.profile_pic_url || null,
        address: overview.endereco || overview.headquarters || actualData.linkedin_info?.headquarters || redes_sociais?.linkedin?.headquarters || null,
        phone: overview.telefone || actualData.linkedin_info?.phone || null,
        market: Array.isArray(mercadoCompany?.mercado_alvo) 
          ? mercadoCompany.mercado_alvo.join(", ") 
          : mercadoCompany?.mercado_alvo || overview.mercado_alvo || overview.market || null,
        business_model: mercadoCompany?.modelo_negocio || overview.modelo_negocio || overview.business_model || null,
        products_services: webhookData?.company?.products_services || webhookData?.company?.produtos_servicos || overview.produtos_servicos || overview.products_services || mercadoCompany?.produtos_servicos || null,
        differentiators: webhookData?.company?.differentiators || webhookData?.company?.diferenciais || overview.diferenciais || overview.differentiators || mercadoCompany?.diferenciais || null,
        partners: mercadoCompany?.parceiros || overview.parceiros || overview.partners || null,
        clients: mercadoCompany?.clientes_citados || overview.clientes_citados || overview.clientes_citados_publicamente || overview.clients || null,
        website: overview.website || 
                 overview.site_institucional || 
                 overview?.positioning?.presenca_digital?.site_institucional || 
                 overview?.positioning?.site_institucional ||
                 `https://${domain}`,
        headquarters: redes_sociais?.linkedin?.headquarters || webhookData?.linkedin_info?.headquarters || overview.endereco || null,
        year_founded: redes_sociais?.linkedin?.founded
          ? parseInt(redes_sociais.linkedin.founded)
          : (webhookData?.linkedin_info?.founded ? parseInt(webhookData.linkedin_info.founded) : null),
        size: redes_sociais?.linkedin?.company_size || webhookData?.linkedin_info?.company_size || overview?.company_size || null,
        employee_count: redes_sociais?.linkedin?.employee_count || webhookData?.linkedin_info?.employee_count || overview?.employee_count || null,
        linkedin_url: redes_sociais?.linkedin?.url || null,
        linkedin_followers: redes_sociais?.linkedin?.followers || webhookData?.linkedin_info?.followers || null,
        linkedin_specialties: redes_sociais?.linkedin?.specialties || webhookData?.linkedin_info?.specialties || webhookData?.linkedin_info?.especialidades || overview?.specialties || overview?.especialidades || null,
        linkedin_tagline: redes_sociais?.linkedin?.tagline || webhookData?.linkedin_info?.tagline || overview?.tagline || null,
        instagram_url: redes_sociais?.instagram?.profileUrl || null,
        instagram_username: redes_sociais?.instagram?.username || null,
        instagram_followers: redes_sociais?.instagram?.profile?.followersCount || null,
        instagram_follows: redes_sociais?.instagram?.profile?.followsCount || null,
        instagram_posts_count: redes_sociais?.instagram?.profile?.postsCount || null,
        youtube_url: redes_sociais?.youtube?.channel?.url || redes_sociais?.youtube?.channel_url || webhookData.youtube_info?.channel?.url || null,
        youtube_channel_name: redes_sociais?.youtube?.channel?.name || redes_sociais?.youtube?.channel_name || webhookData.youtube_info?.channel?.name || null,
        youtube_subscribers: redes_sociais?.youtube?.channel?.subscribers || redes_sociais?.youtube?.subscriber_count || webhookData.youtube_info?.channel?.subscribers || null,
        youtube_total_videos: redes_sociais?.youtube?.channel?.totalVideos || redes_sociais?.youtube?.total_videos || webhookData.youtube_info?.channel?.totalVideos || null,
        youtube_total_views: redes_sociais?.youtube?.channel?.totalViews || redes_sociais?.youtube?.total_views || webhookData.youtube_info?.channel?.totalViews || null,
        blog_url: blog_posts?.blog_url || null,
      };

      let entityId: string;

      // Handle different entity types with explicit table references
      if (entityType === 'competitor' || entityType === 'prospect' || entityType === 'client') {
        const table = labels.table;
        const { data: existing } = await supabase.from(table).select("id").eq("domain", domain).maybeSingle();
        if (existing) {
          await supabase.from(table).update(entityRecord as any).eq("id", existing.id);
          entityId = existing.id;
        } else {
          const { data: newEntity, error } = await supabase.from(table).insert(entityRecord as any).select("id").single();
          if (error) throw error;
          entityId = newEntity.id;
        }
      } else if (entityType === 'primary') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");
        
        const primaryRecord = { ...entityRecord, user_id: user.id, analyzed_at: new Date().toISOString() };
        const { data: existing } = await supabase.from("primary_company").select("id").eq("user_id", user.id).maybeSingle();
        
        if (existing) {
          const { error: updateError } = await supabase.from("primary_company").update(primaryRecord as any).eq("id", existing.id);
          if (updateError) throw updateError;
          entityId = existing.id;
        } else {
          const { data: newEntity, error } = await supabase.from("primary_company").insert(primaryRecord as any).select("id").single();
          if (error) throw error;
          entityId = newEntity.id;
        }
      } else {
        throw new Error(`Unknown entity type: ${entityType}`);
      }

      console.log("Entity saved with ID:", entityId);

      // Save related data utilizing the generic function
      await saveRelatedData(entityId, entityType, redes_sociais, overview, mercado, blog_posts);

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

          await supabase.from(labels.glassdoorTable).delete().eq(labels.glassdoorFk, entityId);
          await supabase.from(labels.glassdoorTable).insert({ [labels.glassdoorFk]: entityId, ...glassdoorBase });
          console.log(`Inserted Glassdoor data for ${entityType}`);
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

  return { saveCompetitor, isSaving };
}
