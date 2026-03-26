import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";
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

// Entity type configuration
const ENTITY_CONFIGS = {
  companies: {
    table: 'companies',
    fkColumn: 'company_id',
    linkedinTable: 'linkedin_posts',
    instagramTable: 'instagram_posts',
    youtubeTable: 'youtube_videos',
    leadershipTable: 'company_leadership',
    marketResearchTable: 'market_research',
    marketNewsTable: 'market_news',
    similarCompaniesTable: 'similar_companies',
    blogTable: 'company_blog_posts',
  },
  prospects: {
    table: 'prospects',
    fkColumn: 'prospect_id',
    linkedinTable: 'prospect_linkedin_posts',
    instagramTable: 'prospect_instagram_posts',
    youtubeTable: 'prospect_youtube_videos',
    leadershipTable: 'prospect_leadership',
    marketResearchTable: 'prospect_market_research',
    marketNewsTable: 'prospect_market_news',
    similarCompaniesTable: 'prospect_similar_companies',
    blogTable: 'prospect_blog_posts',
  },
  clients: {
    table: 'clients',
    fkColumn: 'client_id',
    linkedinTable: 'client_linkedin_posts',
    instagramTable: 'client_instagram_posts',
    youtubeTable: 'client_youtube_videos',
    leadershipTable: 'client_leadership',
    marketResearchTable: 'client_market_research',
    marketNewsTable: 'client_market_news',
    similarCompaniesTable: 'client_similar_companies',
    blogTable: 'client_blog_posts',
  },
  primary: {
    table: 'primary_company',
    fkColumn: 'primary_company_id',
    linkedinTable: 'primary_company_linkedin_posts',
    instagramTable: 'primary_company_instagram_posts',
    youtubeTable: 'primary_company_youtube_videos',
    leadershipTable: 'primary_company_leadership',
    marketResearchTable: 'primary_company_market_research',
    marketNewsTable: 'primary_company_market_news',
    similarCompaniesTable: 'primary_company_similar_companies',
    blogTable: 'primary_company_blog_posts',
  },
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rawPayload = await req.json();

    // ─── PRE-PROCESS: merge N8N "source_type" format ──────────────────────────
    // If the payload has items with source_type, consolidate them into one doc per domain
    const hasMergeFormat = Array.isArray(rawPayload) && rawPayload.some((item: any) => 
      item.source_type || item.linkedin_info || item.instagram_info || item.youtube_info || item.google_maps_info
    );

    let payload: any[];

    if (hasMergeFormat) {
      const merged: Record<string, any> = {};

      // In N8N, an array of items usually belongs to a single execution (one company).
      // Find a domain from ANY item in the array to use as a fallback.
      let sharedDomain = null;
      for (const item of rawPayload) {
        sharedDomain = sharedDomain || 
          item.company?.dominio || 
          item.empresa?.dominio || 
          item.domain || 
          item.linkedin_info?.website?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 
          item.market_research_raw?.company?.dominio;
          
        if (sharedDomain) break;
      }

      for (const item of rawPayload) {
        // Find domain from any source, fallback to sharedDomain
        const domain =
          item.company?.dominio ||
          item.empresa?.dominio ||
          item.domain ||
          item.linkedin_info?.website?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
          item.market_research_raw?.company?.dominio ||
          sharedDomain ||
          null;

        if (!domain) {
          console.warn("Could not determine domain for item during merge:", item);
          continue;
        }

        if (!merged[domain]) merged[domain] = { company: { dominio: domain } };
        const doc = merged[domain];
        const st = item.source_type;

        if (item.linkedin_logo && !doc.linkedin_logo) {
          doc.linkedin_logo = item.linkedin_logo;
        }

        if (st === 'linkedin_info' || item.linkedin_info) {
          const li = item.linkedin_info || item;
          doc.linkedin_info = li;
          if (li.logoUrl && !doc.linkedin_logo) doc.linkedin_logo = li.logoUrl;
          // Merging rather than overwriting
          doc.company = {
            dominio: domain,
            ...doc.company,
            nome: li.name || doc.company?.nome || null,
            descricao_institucional: li.description || doc.company?.descricao_institucional || null,
            setor: li.industry || doc.company?.setor || null,
            website: li.website || doc.company?.website || null,
            linkedin_url: li.url || doc.company?.linkedin_url || null,
            followers: li.followers || doc.company?.followers || null,
            company_size: li.company_size || doc.company?.company_size || null,
            employee_count: li.employee_count || doc.company?.employee_count || null,
            company_type: li.company_type || doc.company?.company_type || null,
            headquarters: li.headquarters || doc.company?.headquarters || null,
            founded: li.founded || doc.company?.founded || null,
            country_code: li.country_code || doc.company?.country_code || null,
            specialties: li.specialties || doc.company?.specialties || [],
            tagline: li.tagline || doc.company?.tagline || null,
          };
          if (Array.isArray(li.similar_companies)) {
            doc.similar_companies = li.similar_companies;
          }
        }

        if (st === 'linkedin_posts' || item.linkedin_posts) {
          if (!doc.linkedin_posts) doc.linkedin_posts = [];
          const p = item.linkedin_posts;
          if (p) {
            if (Array.isArray(p)) doc.linkedin_posts.push(...p);
            else doc.linkedin_posts.push(p);
          }
        }

        if (item.instagram_info && !doc.instagram_info) {
          doc.instagram_info = item.instagram_info;
          if (item.instagram_info.posts) {
            doc.instagram_posts = [...(doc.instagram_posts || []), ...item.instagram_info.posts];
          }
        }

        if (st === 'instagram_posts' || item.posts || item.instagram_posts) {
          const p = item.posts || item.instagram_posts;
          if (p) {
            if (Array.isArray(p)) doc.instagram_posts = [...(doc.instagram_posts || []), ...p];
            else doc.instagram_posts = [...(doc.instagram_posts || []), p];
          }
        }

        if (st === 'youtube_info' || item.youtube_info) {
          doc.youtube_info = item.youtube_info || item;
        }

        if (st === 'glassdoor_info' || item.glassdoor_info) {
          doc.glassdoor_info = item.glassdoor_info || item;
        }

        if (st === 'blog_posts' || item.blog_posts) {
          const posts = item.posts || item.blog_posts || [];
          doc.blog_posts = [...(doc.blog_posts || []), ...posts];
        }

        if (item.market_research_raw) {
          doc.market_research_raw = item.market_research_raw;
          // Extract domain from market_research_raw if not set
          if (!doc.company?.dominio && item.market_research_raw?.company?.dominio) {
            doc.company = { ...doc.company, dominio: item.market_research_raw.company.dominio };
          }
        }

        if (item.similar_companies && !doc.similar_companies) {
          doc.similar_companies = item.similar_companies;
        }

        // Also handle the non-source_type root item that has company directly
        if (item.company?.dominio && !st) {
          Object.assign(doc, item);
        }
      }

      payload = Object.values(merged);
      console.log(`Merged format: consolidated into ${payload.length} domain(s)`);
    } else {
      payload = rawPayload;
    }
    // ─────────────────────────────────────────────────────────────────────────

    for (const webhookData of payload) {
      const domain = webhookData.company?.dominio || webhookData.empresa?.dominio || null;
      if (!domain) {
        console.warn("Skipping entry without domain");
        continue;
      }

      const actualData = webhookData.market_research_raw || webhookData;
      const overview = webhookData.overview || actualData.overview || actualData.visao_geral || {};
      const redes_sociais = webhookData.redes_sociais || actualData.redes_sociais || webhookData.social_media || actualData.social_media || {};
      const mercado = webhookData.market_research_raw || actualData.mercado || actualData;
      
      // Coletar múltiplos candidatos a companyData e mesclar todos
      const allCands = [
        mercado?.company,
        overview,
        actualData.company,
        webhookData.empresa,
        webhookData.company
      ].filter(Boolean);
      
      const companyData = allCands.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      const mercadoCompany = mercado?.company || {};

      // Also pull from linkedin_info if available
      const liInfo = webhookData.linkedin_info || {};

      // Resolve digital presence URLs as fallback
      const presencaDigital = mercado?.positioning?.presenca_digital || {};

      // Resolve blog_posts - can be array of posts directly or wrapped in {posts:[...]}
      let blog_posts: any[] = [];
      const rawBlog = actualData.blog_posts || webhookData.blog_posts || null;
      if (Array.isArray(rawBlog)) {
        blog_posts = rawBlog.length > 0 && rawBlog[0]?.posts ? rawBlog[0].posts : rawBlog;
      } else if (rawBlog?.posts) {
        blog_posts = rawBlog.posts;
      }

      const entityRecord: Record<string, any> = {
        domain: domain,
        name: companyData.nome || companyData.name || liInfo.name || overview.nome || overview.name || null,
        description: companyData.descricao_institucional || companyData.description || liInfo.description || overview.descricao_institucional || overview.description || null,
        industry: companyData.setor || companyData.industry || liInfo.industry || overview.setor || overview.industry || null,
        sector: companyData.setor || overview.setor || overview.sector || null,
        logo_url: webhookData.linkedin_logo || liInfo.logoUrl || redes_sociais?.linkedin?.logo_url || companyData.logo_url || null,
        address: companyData.headquarters || companyData.endereco || companyData.address || null,
        phone: companyData.phone || companyData.telefone || overview.telefone || null,
        market: mercadoCompany?.mercado_alvo || overview.mercado_alvo || null,
        business_model: mercadoCompany?.modelo_negocio || overview.modelo_negocio || null,
        products_services: companyData.produtos_servicos || companyData.products_services || mercadoCompany?.produtos_servicos || null,
        differentiators: companyData.diferenciais || companyData.differentiators || mercadoCompany?.diferenciais || null,
        partners: mercadoCompany?.parceiros || overview.parceiros || null,
        clients: mercadoCompany?.clientes_citados || overview.clientes_citados || null,
        website: (function() {
          const url = companyData.website || liInfo.website || overview.website || overview.site_institucional || companyData.site || presencaDigital?.site_institucional || null;
          if (!url) return null;
          return url.startsWith('http') ? url : `https://${url}`;
        })(),
        headquarters: companyData.headquarters || liInfo.headquarters || redes_sociais?.linkedin?.headquarters || overview.endereco || null,
        year_founded: (function() {
          const val = companyData.founded || companyData.founded_year || companyData.ano_fundacao || liInfo.founded || 
                      mercadoCompany.founded || mercadoCompany.founded_year || mercadoCompany.ano_fundacao || null;
          if (!val) return null;
          const parsed = parseInt(String(val).replace(/[^\d]/g, ''));
          return isNaN(parsed) ? null : parsed;
        })(),
        size: companyData.company_size || liInfo.company_size || redes_sociais?.linkedin?.company_size || null,
        employee_count: companyData.employee_count || liInfo.employee_count || redes_sociais?.linkedin?.employee_count || null,
        linkedin_url: (function() {
          const url = companyData.linkedin_url || liInfo.url || redes_sociais?.linkedin?.url || presencaDigital?.linkedin || companyData.linkedin || 
                      mercadoCompany.linkedin_url || mercadoCompany.linkedin || null;
          if (!url) return null;
          return url.startsWith('http') ? url : `https://${url}`;
        })(),
        linkedin_followers: (function() {
           const val = companyData.followers || liInfo.followers || redes_sociais?.linkedin?.followers || companyData.followers_count || 
                       mercadoCompany.followers || mercadoCompany.followers_count || webhookData.followers || null;
           return val ? parseInt(String(val)) : null;
        })(),
        linkedin_specialties: companyData.specialties || liInfo.specialties || redes_sociais?.linkedin?.specialties || null,
        linkedin_tagline: companyData.tagline || liInfo.tagline || redes_sociais?.linkedin?.tagline || null,
        instagram_url: (function() {
          const url = webhookData?.instagram_info?.profileUrl || redes_sociais?.instagram?.profileUrl || presencaDigital?.instagram || 
                      webhookData?.instagram_info?.url || redes_sociais?.instagram?.url || null;
          if (!url) return null;
          return url.startsWith('http') ? url : `https://${url}`;
        })(),
        instagram_username: webhookData?.instagram_info?.username || redes_sociais?.instagram?.username || null,
        instagram_followers: (function() {
           const val = webhookData?.instagram_info?.profile?.followersCount || redes_sociais?.instagram?.profile?.followersCount || 
                       webhookData?.instagram_info?.followersCount || redes_sociais?.instagram?.followersCount || null;
           return val ? parseInt(String(val)) : null;
        })(),
        instagram_follows: webhookData?.instagram_info?.profile?.followsCount || redes_sociais?.instagram?.profile?.followsCount || null,
        instagram_posts_count: webhookData?.instagram_info?.profile?.postsCount || redes_sociais?.instagram?.profile?.postsCount || null,
        youtube_url: (function() {
          const url = webhookData?.youtube_info?.channel?.url || redes_sociais?.youtube?.channel?.url || presencaDigital?.youtube || null;
          if (!url) return null;
          if (typeof url === 'string' && url.includes('linkedin.com')) return null;
          return url.startsWith('http') ? url : `https://${url}`;
        })(),
        youtube_channel_name: webhookData?.youtube_info?.channel?.name || redes_sociais?.youtube?.channel?.name || null,
        youtube_subscribers: webhookData?.youtube_info?.channel?.subscribers || redes_sociais?.youtube?.channel?.subscribers || null,
        youtube_total_videos: webhookData?.youtube_info?.channel?.totalVideos || redes_sociais?.youtube?.channel?.totalVideos || null,
        youtube_total_views: webhookData?.youtube_info?.channel?.totalViews || redes_sociais?.youtube?.channel?.totalViews || null,
        blog_url: companyData.blog_url || null,
        analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Detect which tables contain this domain and update all of them
      const tablesToUpdate: string[] = [];

      for (const tableKey of Object.keys(ENTITY_CONFIGS)) {
        const cfg = ENTITY_CONFIGS[tableKey as keyof typeof ENTITY_CONFIGS];
        const { data: existing } = await supabase.from(cfg.table).select('id').eq('domain', domain).maybeSingle();
        if (existing) {
          tablesToUpdate.push(tableKey);
        }
      }

      // If domain not found anywhere, default to companies (new competitor)
      if (tablesToUpdate.length === 0) {
        tablesToUpdate.push('companies');
      }

      for (const tableKey of tablesToUpdate) {
        const cfg = ENTITY_CONFIGS[tableKey as keyof typeof ENTITY_CONFIGS];
        const fk = cfg.fkColumn;

        // Upsert entity record
        
        // Usar uma cópia para evitar contaminação entre tabelas
        const recordToUpsert = { ...entityRecord };
        
        // Se estivermos atualizando a tabela 'companies', precisamos garantir que o entity_type não seja 'rebaixado'
        if (tableKey === 'companies') {
          const { data: current } = await supabase.from('companies').select('entity_type').eq('domain', domain).maybeSingle();
          if (current?.entity_type === 'primary') {
             recordToUpsert.entity_type = 'primary';
          } else {
             recordToUpsert.entity_type = (webhookData.source_type && webhookData.source_type !== 'company') ? webhookData.source_type : 'competitor';
          }
        }

        const { data: insertedEntity, error: entityError } = await supabase
          .from(cfg.table)
          .upsert(recordToUpsert, { onConflict: 'domain' })
          .select()
          .single();

        if (entityError) {
          console.error(`Error upserting to ${cfg.table}:`, entityError);
          continue;
        }

        const entityId = insertedEntity.id;
        console.log(`Updated ${cfg.table} id: ${entityId}`);

        // LinkedIn Posts
        if (webhookData?.linkedin_posts?.length > 0) {
          await supabase.from(cfg.linkedinTable).delete().eq(fk, entityId);
          const posts = webhookData.linkedin_posts.map((post: any) => ({
            [fk]: entityId,
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
          await supabase.from(cfg.linkedinTable).insert(posts);
          console.log(`Saved ${posts.length} linkedin posts to ${cfg.linkedinTable}`);
        }

        // Instagram
        if (webhookData?.instagram_posts?.length > 0) {
          await supabase.from(cfg.instagramTable).delete().eq(fk, entityId);
          const posts = webhookData.instagram_posts.map((post: any) => ({
            [fk]: entityId,
            external_id: post.id || null,
            caption: post.caption || null,
            url: post.url || null,
            media_type: post.mediaType || null,
            media_url: post.mediaUrl || null,
            thumbnail_url: post.thumbnailUrl || null,
            likes_count: post.likesCount || 0,
            comments_count: post.commentsCount || 0,
            timestamp: post.timestamp || null,
          }));
          await supabase.from(cfg.instagramTable).insert(posts);
          console.log(`Saved ${posts.length} instagram posts to ${cfg.instagramTable}`);
        }

        // YouTube
        if (webhookData?.youtube_info?.videos?.length > 0) {
          await supabase.from(cfg.youtubeTable).delete().eq(fk, entityId);
          const videos = webhookData.youtube_info.videos.map((video: any) => ({
            [fk]: entityId,
            external_id: video.id || null,
            title: video.title || null,
            url: video.url || null,
            thumbnail_url: video.thumbnailUrl || null,
            view_count: video.viewCount || 0,
            likes: video.likes || 0,
            comments_count: video.commentsCount || 0,
            published_at: video.publishedAt || null,
          }));
          await supabase.from(cfg.youtubeTable).insert(videos);
          console.log(`Saved ${videos.length} youtube videos to ${cfg.youtubeTable}`);
        }

        // Leadership
        const pessoas_chave = mercadoCompany?.pessoas_chave || [];
        if (pessoas_chave.length > 0) {
          await supabase.from(cfg.leadershipTable).delete().eq(fk, entityId);
          const leadership = pessoas_chave.map((leader: any) => ({
            [fk]: entityId,
            name: leader.nome || null,
            position: leader.cargo || null,
            source: leader.fonte_url || null,
          }));
          await supabase.from(cfg.leadershipTable).insert(leadership);
        }

        // Market Research
        await supabase.from(cfg.marketResearchTable).delete().eq(fk, entityId);
        const researchRecord: Record<string, any> = {
          [fk]: entityId,
          institutional_discourse: mercado?.positioning?.discurso_institucional || null,
          recurring_topics: mercado?.positioning?.topicos_recorrentes || null,
          digital_presence: mercado?.positioning?.presenca_digital || null,
          public_actions: mercado?.positioning?.acoes_publicas || null,
          institutional_curiosities: mercado?.positioning?.curiosidades_institucionais || null,
          overall_analysis: mercado?.strategic_analysis?.resumo_executivo || null,
          strategic_analysis: mercado?.strategic_analysis || null,
          events: mercado?.eventos || [],
          source_references: Array.isArray(mercado?.references) ? mercado.references.join(", ") : undefined,
        };
        await supabase.from(cfg.marketResearchTable).insert(researchRecord);

        // Market News
        const newsData = mercado?.news_and_market_actions || mercado?.news_and_actions || [];
        if (newsData.length > 0) {
          await supabase.from(cfg.marketNewsTable).delete().eq(fk, entityId);
          const news = newsData.map((n: any) => ({
            [fk]: entityId,
            title: n.titulo || null,
            url: n.url || null,
            date: formatDateForSupabase(n.data),
            summary: n.resumo || null,
            classification: n.tipo || null,
          }));
          await supabase.from(cfg.marketNewsTable).insert(news);
        }

        // Similar Companies
        if (webhookData?.similar_companies?.length > 0) {
          await supabase.from(cfg.similarCompaniesTable).delete().eq(fk, entityId);
          const similar = webhookData.similar_companies.map((sc: any) => ({
            [fk]: entityId,
            name: sc.name || null,
            industry: sc.industry || null,
            location: sc.location || null,
            url: sc.url || null,
            logo_url: sc.logo_url || null,
            source: sc.source || null,
          }));
          await supabase.from(cfg.similarCompaniesTable).insert(similar);
        }

        // Blog Posts
        if (blog_posts.length > 0) {
          await supabase.from(cfg.blogTable).delete().eq(fk, entityId);
          const posts = blog_posts.map((post: any) => ({
            [fk]: entityId,
            title: post.title || null,
            url: post.url || null,
            published_at: post.published_at || null,
            reading_time_minutes: post.reading_time_minutes || null,
            categories: Array.isArray(post.categories)
              ? post.categories.map((c: any) => typeof c === 'object' && c !== null ? c.name : c).join(", ")
              : null,
          }));
          await supabase.from(cfg.blogTable).insert(posts);
          console.log(`Saved ${posts.length} blog posts to ${cfg.blogTable}`);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
