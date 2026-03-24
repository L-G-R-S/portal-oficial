import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts";


const WEBHOOK_FULL = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficial'
const WEBHOOK_CONTENT = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficialautomatico'
const WEBHOOK_NEWS = 'https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/newsupdater'

interface Entity {
  id: string
  domain: string
  name: string | null
  entityType: string
}

interface WebhookResponse {
  overview: any
  redes_sociais: any
  glassdoor?: any
  mercado: any
}

// Entity table configurations
const entityConfig = {
  competitor: {
    table: 'companies',
    glassdoorTable: 'glassdoor_summary',
    glassdoorFk: 'company_id',
    leadershipTable: 'company_leadership',
    linkedinTable: 'linkedin_posts',
    instagramTable: 'instagram_posts',
    youtubeTable: 'youtube_videos',
    marketResearchTable: 'market_research',
    marketNewsTable: 'market_news',
    similarCompaniesTable: 'similar_companies',
    blogTable: 'company_blog_posts',
    fkColumn: 'company_id'
  },
  prospect: {
    table: 'prospects',
    glassdoorTable: 'prospect_glassdoor_summary',
    glassdoorFk: 'prospect_id',
    leadershipTable: 'prospect_leadership',
    linkedinTable: 'prospect_linkedin_posts',
    instagramTable: 'prospect_instagram_posts',
    youtubeTable: 'prospect_youtube_videos',
    marketResearchTable: 'prospect_market_research',
    marketNewsTable: 'prospect_market_news',
    similarCompaniesTable: 'prospect_similar_companies',
    blogTable: 'prospect_blog_posts',
    fkColumn: 'prospect_id'
  },
  client: {
    table: 'clients',
    glassdoorTable: 'client_glassdoor_summary',
    glassdoorFk: 'client_id',
    leadershipTable: 'client_leadership',
    linkedinTable: 'client_linkedin_posts',
    instagramTable: 'client_instagram_posts',
    youtubeTable: 'client_youtube_videos',
    marketResearchTable: 'client_market_research',
    marketNewsTable: 'client_market_news',
    similarCompaniesTable: 'client_similar_companies',
    blogTable: 'client_blog_posts',
    fkColumn: 'client_id'
  }
}

async function saveEntityData(
  supabase: any, 
  entityId: string, 
  webhookData: WebhookResponse, 
  entityType: string
) {
  const config = entityConfig[entityType as keyof typeof entityConfig]
  let wData = Array.isArray(webhookData) ? webhookData[0] : (webhookData || {} as any);
  if (wData.json) wData = wData.json;
  const overview = wData.company || wData.linkedin_info || wData.overview || {};
  const redes_sociais = wData.redes_sociais || {
    linkedin: { posts: wData.linkedin_posts },
    instagram: { posts: wData.instagram_posts },
    youtube: wData.youtube_info 
  };
  const mercado = wData.mercado || wData.market_research_raw || {};
  
  if (!mercado.similar_companies || mercado.similar_companies.length === 0) {
    mercado.similar_companies = wData.similar_companies || wData.linkedin_info?.similar_companies || overview.similar_companies || [];
  }
  if (!mercado.news_and_actions || mercado.news_and_actions.length === 0) {
    mercado.news_and_actions = mercado.news_and_market_actions || mercado.noticias || wData.noticias || [];
  }

  const glassdoor = wData.glassdoor_info || (redes_sociais?.glassdoor || wData.glassdoor);
  const blog_posts = wData.blog_posts || null;
  const mercadoCompany = mercado?.company || {};

  // Build entity record
  const entityRecord: Record<string, any> = {
    name: overview?.nome || null,
    description: overview?.descricao_institucional || null,
    industry: overview?.setor || null,
    sector: overview?.setor || null,
    logo_url: wData.linkedin_logo || overview?.logo_url || wData.linkedin_info?.profile_pic_url || wData.linkedin_info?.logoUrl || redes_sociais?.linkedin?.profile_pic_url || null,
    address: overview?.endereco || overview?.headquarters || wData.linkedin_info?.headquarters || redes_sociais?.linkedin?.headquarters || null,
    phone: overview?.telefone || wData.linkedin_info?.phone || null,
    market: Array.isArray(mercadoCompany?.mercado_alvo) 
      ? mercadoCompany.mercado_alvo.join(", ") 
      : (mercadoCompany?.mercado_alvo || overview?.mercado_alvo || overview?.market || null),
    business_model: mercadoCompany?.modelo_negocio || overview?.modelo_negocio || overview?.business_model || null,
    products_services: wData?.company?.products_services || wData?.company?.produtos_servicos || overview?.produtos_servicos || overview?.products_services || mercadoCompany?.produtos_servicos || null,
    differentiators: wData?.company?.differentiators || wData?.company?.diferenciais || overview?.diferenciais || overview?.differentiators || mercadoCompany?.diferenciais || null,
    partners: mercadoCompany?.parceiros || overview?.parceiros || overview?.partners || null,
    clients: mercadoCompany?.clientes_citados || overview?.clientes_citados || overview?.clientes_citados_publicamente || overview?.clients || null,
    website: overview?.website || overview?.site_institucional || overview?.positioning?.presenca_digital?.site_institucional || null,
    headquarters: redes_sociais?.linkedin?.headquarters || wData.linkedin_info?.headquarters || overview?.endereco || overview?.headquarters || null,
    year_founded: overview?.founded ? parseInt(overview.founded) : (redes_sociais?.linkedin?.founded ? parseInt(redes_sociais.linkedin.founded) : (wData.linkedin_info?.founded ? parseInt(wData.linkedin_info.founded) : null)),
    size: redes_sociais?.linkedin?.company_size || wData.linkedin_info?.company_size || overview?.company_size || null,
    employee_count: overview?.employee_count || redes_sociais?.linkedin?.employee_count || wData.linkedin_info?.employee_count || null,
    linkedin_url: redes_sociais?.linkedin?.url || null,
    linkedin_followers: overview?.followers || redes_sociais?.linkedin?.followers || wData.linkedin_info?.followers || null,
    linkedin_specialties: redes_sociais?.linkedin?.specialties || wData.linkedin_info?.specialties || wData.linkedin_info?.especialidades || overview?.specialties || overview?.especialidades || null,
    linkedin_tagline: redes_sociais?.linkedin?.tagline || wData.linkedin_info?.tagline || overview?.tagline || null,
    instagram_url: redes_sociais?.instagram?.profileUrl || wData.instagram_info?.profileUrl || null,
    instagram_username: redes_sociais?.instagram?.username || wData.instagram_info?.username || null,
    instagram_followers: redes_sociais?.instagram?.profile?.followersCount || wData.instagram_info?.profile?.followersCount || null,
    instagram_follows: redes_sociais?.instagram?.profile?.followsCount || wData.instagram_info?.profile?.followsCount || null,
    instagram_posts_count: redes_sociais?.instagram?.profile?.postsCount || wData.instagram_info?.profile?.postsCount || null,
    youtube_url: redes_sociais?.youtube?.channel?.url || redes_sociais?.youtube?.channel_url || wData.youtube_info?.channel?.url || null,
    youtube_channel_name: redes_sociais?.youtube?.channel?.name || redes_sociais?.youtube?.channel_name || wData.youtube_info?.channel?.name || null,
    youtube_subscribers: redes_sociais?.youtube?.channel?.subscribers || redes_sociais?.youtube?.subscriber_count || wData.youtube_info?.channel?.subscribers || null,
    youtube_total_videos: redes_sociais?.youtube?.channel?.totalVideos || redes_sociais?.youtube?.total_videos || wData.youtube_info?.channel?.totalVideos || null,
    youtube_total_views: redes_sociais?.youtube?.channel?.totalViews || redes_sociais?.youtube?.total_views || wData.youtube_info?.channel?.totalViews || null,
    blog_url: blog_posts?.blog_url || null,
    updated_at: new Date().toISOString()
  }

  // Update main entity
  const { error: updateError } = await supabase.from(config.table).update(entityRecord).eq('id', entityId)
  if (updateError) {
    console.error(`[batch-update-sync] ERROR updating entity ${entityId}:`, updateError.message, updateError.code, updateError.details)
    throw new Error(`Failed to update entity: ${updateError.message}`)
  }
  console.log(`[batch-update-sync] Updated entity ${entityId} in ${config.table}`)

  // Save Glassdoor data
  if (glassdoor && (glassdoor.overall_rating || glassdoor.rating)) {
    const glassdoorBase = {
      [config.glassdoorFk]: entityId,
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
    }
    
    const { error: deleteGlassdoorError } = await supabase.from(config.glassdoorTable).delete().eq(config.glassdoorFk, entityId)
    if (deleteGlassdoorError) {
      console.error(`[batch-update-sync] ERROR deleting old Glassdoor:`, deleteGlassdoorError.message)
    }
    
    const { error: insertGlassdoorError } = await supabase.from(config.glassdoorTable).insert(glassdoorBase)
    if (insertGlassdoorError) {
      console.error(`[batch-update-sync] ERROR inserting Glassdoor:`, insertGlassdoorError.message, insertGlassdoorError.code, insertGlassdoorError.details)
    } else {
      console.log(`[batch-update-sync] Saved Glassdoor data`)
    }
  }

  // Save LinkedIn posts (UPSERT to preserve history)
  if (redes_sociais?.linkedin?.posts?.length > 0) {
    const posts = redes_sociais.linkedin.posts
      .filter((post: any) => post.id) // Only posts with external_id
      .map((post: any) => ({
        [config.fkColumn]: entityId,
        external_id: post.id,
        text: post.text || null,
        url: post.url || null,
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
      }))
    if (posts.length > 0) {
      const { error: upsertLinkedinError } = await supabase.from(config.linkedinTable).upsert(posts, { 
        onConflict: `${config.fkColumn},external_id`,
        ignoreDuplicates: false 
      })
      if (upsertLinkedinError) {
        console.error(`[batch-update-sync] ERROR upserting LinkedIn posts:`, upsertLinkedinError.message, upsertLinkedinError.code, upsertLinkedinError.details)
      } else {
        console.log(`[batch-update-sync] Upserted ${posts.length} LinkedIn posts`)
      }
    }
  }

  // Save Instagram posts (UPSERT to preserve history)
  if (redes_sociais?.instagram?.posts?.length > 0) {
    const posts = redes_sociais.instagram.posts
      .filter((post: any) => post.id) // Only posts with external_id
      .map((post: any) => ({
        [config.fkColumn]: entityId,
        external_id: post.id,
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
      }))
    if (posts.length > 0) {
      const { error: upsertInstagramError } = await supabase.from(config.instagramTable).upsert(posts, { 
        onConflict: `${config.fkColumn},external_id`,
        ignoreDuplicates: false 
      })
      if (upsertInstagramError) {
        console.error(`[batch-update-sync] ERROR upserting Instagram posts:`, upsertInstagramError.message, upsertInstagramError.code, upsertInstagramError.details)
      } else {
        console.log(`[batch-update-sync] Upserted ${posts.length} Instagram posts`)
      }
    }
  }

  // Save YouTube videos (UPSERT to preserve history)
  if (redes_sociais?.youtube?.videos?.length > 0) {
    const videos = redes_sociais.youtube.videos
      .filter((video: any) => video.id) // Only videos with external_id
      .map((video: any) => ({
        [config.fkColumn]: entityId,
        external_id: video.id,
        title: video.title || null,
        url: video.url || null,
        thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
        view_count: video.viewCount || video.views || 0,
        likes: video.likes || 0,
        comments_count: video.commentsCount || video.comments || 0,
        published_at: video.publishedAt || video.published_at || null,
      }))
    if (videos.length > 0) {
      const { error: upsertYoutubeError } = await supabase.from(config.youtubeTable).upsert(videos, { 
        onConflict: `${config.fkColumn},external_id`,
        ignoreDuplicates: false 
      })
      if (upsertYoutubeError) {
        console.error(`[batch-update-sync] ERROR upserting YouTube videos:`, upsertYoutubeError.message, upsertYoutubeError.code, upsertYoutubeError.details)
      } else {
        console.log(`[batch-update-sync] Upserted ${videos.length} YouTube videos`)
      }
    }
  }

  // Save Leadership
  const pessoas_chave = mercadoCompany?.pessoas_chave || overview?.pessoas_chave || overview?.lideranca || [];
  if (pessoas_chave.length > 0) {
    const { error: deleteLeadershipError } = await supabase.from(config.leadershipTable).delete().eq(config.fkColumn, entityId)
    if (deleteLeadershipError) {
      console.error(`[batch-update-sync] ERROR deleting old leadership:`, deleteLeadershipError.message)
    }
    
    const leadership = pessoas_chave.map((leader: any) => ({
      [config.fkColumn]: entityId,
      name: leader.nome || null,
      position: leader.cargo || null,
      linkedin_url: leader.linkedin || leader.linkedin_url || null,
      source: leader.url_fonte || leader.fonte_url || null,
    }))
    
    const { error: insertLeadershipError } = await supabase.from(config.leadershipTable).insert(leadership)
    if (insertLeadershipError) {
      console.error(`[batch-update-sync] ERROR inserting leadership:`, insertLeadershipError.message, insertLeadershipError.code, insertLeadershipError.details)
    } else {
      console.log(`[batch-update-sync] Saved ${leadership.length} leadership records`)
    }
  }

  // Save Market Research
  const { error: deleteResearchError } = await supabase.from(config.marketResearchTable).delete().eq(config.fkColumn, entityId)
  if (deleteResearchError) {
    console.error(`[batch-update-sync] ERROR deleting old market research:`, deleteResearchError.message)
  }
  
  const marketResearch = {
    [config.fkColumn]: entityId,
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
  }
  
  const { error: insertResearchError } = await supabase.from(config.marketResearchTable).insert(marketResearch)
  if (insertResearchError) {
    console.error(`[batch-update-sync] ERROR inserting market research:`, insertResearchError.message, insertResearchError.code, insertResearchError.details)
  } else {
    console.log(`[batch-update-sync] Saved market research data`)
  }

  // Save Market News
  const newsData = mercado?.news_and_actions || mercado?.news_and_market_actions || [];
  if (newsData.length > 0) {
    const { error: deleteNewsError } = await supabase.from(config.marketNewsTable).delete().eq(config.fkColumn, entityId)
    if (deleteNewsError) {
      console.error(`[batch-update-sync] ERROR deleting old market news:`, deleteNewsError.message)
    }
    
    const news = newsData.map((n: any) => ({
      [config.fkColumn]: entityId,
      title: n.titulo || n.title || null,
      url: n.url || null,
      date: n.data || n.date || null,
      summary: n.resumo || n.summary || null,
      classification: n.tipo || n.classification || n.classificacao || null,
    }))
    
    console.log(`[batch-update-sync] Attempting to insert ${news.length} news items...`)
    const { error: insertNewsError } = await supabase.from(config.marketNewsTable).insert(news)
    if (insertNewsError) {
      console.error(`[batch-update-sync] ERROR inserting market news:`, insertNewsError.message, insertNewsError.code, insertNewsError.details)
      throw new Error(`Failed to insert market news: ${insertNewsError.message}`)
    } else {
      console.log(`[batch-update-sync] Successfully saved ${news.length} news records`)
    }
  }

  // Save Similar Companies
  if (overview?.similar_companies?.length > 0 || mercado?.similar_companies?.length > 0) {
    const { error: deleteSimilarError } = await supabase.from(config.similarCompaniesTable).delete().eq(config.fkColumn, entityId)
    if (deleteSimilarError) {
      console.error(`[batch-update-sync] ERROR deleting old similar companies:`, deleteSimilarError.message)
    }
    
    const allSimilar: any[] = []
    if (overview?.similar_companies?.length > 0) {
      overview.similar_companies.forEach((sc: any) => {
        allSimilar.push({
          [config.fkColumn]: entityId,
          name: sc.name || null,
          industry: sc.industry || null,
          location: sc.location || null,
          url: sc.url || null,
          logo_url: sc.logo_url || null,
          source: "overview",
        })
      })
    }
    if (mercado?.similar_companies?.length > 0) {
      mercado.similar_companies.forEach((sc: any) => {
        allSimilar.push({
          [config.fkColumn]: entityId,
          name: sc.name || sc.nome || null,
          industry: sc.industry || sc.setor || null,
          location: sc.location || sc.localizacao || null,
          url: sc.url || null,
          logo_url: sc.logo_url || null,
          source: "mercado",
        })
      })
    }
    if (allSimilar.length > 0) {
      const { error: insertSimilarError } = await supabase.from(config.similarCompaniesTable).insert(allSimilar)
      if (insertSimilarError) {
        console.error(`[batch-update-sync] ERROR inserting similar companies:`, insertSimilarError.message, insertSimilarError.code, insertSimilarError.details)
      } else {
        console.log(`[batch-update-sync] Saved ${allSimilar.length} similar companies`)
      }
    }
  }

  // Save Blog Posts
  let blogPostsArray = [];
  if (Array.isArray(blog_posts)) {
    blogPostsArray = blog_posts.length > 0 && blog_posts[0].posts ? blog_posts[0].posts : blog_posts;
  } else if (blog_posts?.posts) {
    blogPostsArray = blog_posts.posts;
  }
  if (blogPostsArray.length > 0) {
    const { error: deleteBlogError } = await supabase.from((config as any).blogTable).delete().eq(config.fkColumn, entityId)
    if (deleteBlogError) {
      console.error(`[batch-update-sync] ERROR deleting old blog posts:`, deleteBlogError.message)
    }
    
    const posts = blogPostsArray.map((post: any) => ({
      [config.fkColumn]: entityId,
      title: post.title || null,
      url: post.url || null,
      published_at: post.published_at || null,
      reading_time_minutes: post.reading_time_minutes || null,
      categories: Array.isArray(post.categories) ? post.categories.map((c: any) => typeof c === 'object' && c !== null ? c.name : c).join(", ") : post.categories || null,
      cover_image_url: post.cover_image_url || null,
      author: post.author || null,
    }))
    
    if (posts.length > 0) {
      const { error: insertBlogError } = await supabase.from((config as any).blogTable).insert(posts)
      if (insertBlogError) {
        console.error(`[batch-update-sync] ERROR inserting blog posts:`, insertBlogError.message, insertBlogError.code, insertBlogError.details)
      } else {
        console.log(`[batch-update-sync] Saved ${posts.length} blog posts`)
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // ============ SECURITY: Validate JWT Authentication ============
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[batch-update-sync] Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    // First validate the user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: authError } = await userClient.auth.getUser(token)
    
    if (authError || !userData.user) {
      console.error('[batch-update-sync] Invalid token:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY: Extract user_id from JWT, NOT from request body
    const user_id = userData.user.id
    console.log(`[batch-update-sync] Authenticated user: ${user_id}`)
    // ============ END SECURITY ============

    // Use service role for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Only extract entity_types, log_id, update_type, trigger_type from body (not user_id for security)
    const { entity_types, log_id, update_type = 'full', trigger_type = 'manual' } = await req.json()

    const isNewsOnly = update_type === 'news_only'
    const isContentNews = update_type === 'content_news'
    const webhookUrl = isNewsOnly ? WEBHOOK_NEWS : (isContentNews ? WEBHOOK_CONTENT : WEBHOOK_FULL)

    const updateTypeLabel = isNewsOnly ? 'NEWS ONLY' : (isContentNews ? 'CONTENT & NEWS' : 'FULL')
    console.log(`[batch-update-sync] Starting ${updateTypeLabel} SYNCHRONOUS update for user ${user_id}`)
    console.log(`[batch-update-sync] Entity types: ${JSON.stringify(entity_types)}`)
    console.log(`[batch-update-sync] Log ID: ${log_id}`)
    console.log(`[batch-update-sync] Trigger type: ${trigger_type}`)

    // Collect all entities to update
    const allEntities: Entity[] = []

    // Fetch competitors
    if (entity_types.includes('competitor')) {
      const { data: competitors, error } = await supabase
        .from('companies')
        .select('id, domain, name')
      
      if (!error && competitors) {
        competitors.forEach((c: any) => {
          if (c.domain) {
            allEntities.push({ id: c.id, domain: c.domain, name: c.name, entityType: 'competitor' })
          }
        })
      }
      console.log(`[batch-update-sync] Found ${competitors?.length || 0} competitors`)
    }

    // Fetch prospects
    if (entity_types.includes('prospect')) {
      const { data: prospects, error } = await supabase
        .from('prospects')
        .select('id, domain, name')
      
      if (!error && prospects) {
        prospects.forEach((p: any) => {
          if (p.domain) {
            allEntities.push({ id: p.id, domain: p.domain, name: p.name, entityType: 'prospect' })
          }
        })
      }
      console.log(`[batch-update-sync] Found ${prospects?.length || 0} prospects`)
    }

    // Fetch clients
    if (entity_types.includes('client')) {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, domain, name')
      
      if (!error && clients) {
        clients.forEach((c: any) => {
          if (c.domain) {
            allEntities.push({ id: c.id, domain: c.domain, name: c.name, entityType: 'client' })
          }
        })
      }
      console.log(`[batch-update-sync] Found ${clients?.length || 0} clients`)
    }

    console.log(`[batch-update-sync] Total entities to update: ${allEntities.length}`)

    // Update log with total count and set status to running
    if (log_id) {
      await supabase
        .from('update_logs')
        .update({ 
          total_entities: allEntities.length,
          status: 'running',
          current_entity_name: null,
          current_entity_domain: null
        })
        .eq('id', log_id)
    }

    // Process ALL entities in PARALLEL using Promise.all
    let entitiesUpdated = 0
    let failedEntities: string[] = []

    console.log(`[batch-update-sync] Dispatching ${allEntities.length} entities in PARALLEL...`)

    // Create all webhook promises at once
    const webhookPromises = allEntities.map(async (entity, index) => {
      const entityStartTime = new Date()
      console.log(`[batch-update-sync] Processing ${entity.domain} (${index + 1}/${allEntities.length})`)
      console.log(`[batch-update-sync] Calling ${isNewsOnly ? 'news' : (isContentNews ? 'content' : 'full')} webhook for ${entity.domain}...`)

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: entity.domain,
            entity_type: entity.entityType
          }),
        })

        if (!webhookResponse.ok) {
          throw new Error(`Webhook returned ${webhookResponse.status}`)
        }

        const webhookData = await webhookResponse.json()
        const duration = Math.round((Date.now() - entityStartTime.getTime()) / 1000)
        console.log(`[batch-update-sync] Received response for ${entity.domain} in ${duration}s`)

        return { 
          entity, 
          webhookData, 
          success: true, 
          duration,
          startTime: entityStartTime,
          error: null 
        }
      } catch (error) {
        console.error(`[batch-update-sync] Error fetching ${entity.domain}:`, error)
        return { 
          entity, 
          webhookData: null, 
          success: false, 
          duration: 0,
          startTime: entityStartTime,
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }
    })

    // Wait for ALL webhook responses
    const results = await Promise.all(webhookPromises)

    // Process all results and save data
    for (const result of results) {
      const { entity, webhookData, success, duration, startTime, error } = result

      if (!success || !webhookData) {
        failedEntities.push(entity.domain)
        
        // Save failed activity log
        const { error: activityLogError } = await supabase
          .from('analysis_activity_log')
          .insert({
            user_id: user_id,
            batch_log_id: log_id,
            entity_id: entity.id,
            entity_type: entity.entityType,
            entity_name: entity.name,
            entity_domain: entity.domain,
            trigger_type: trigger_type,
            update_type: update_type,
            status: 'failed',
            started_at: startTime.toISOString(),
            completed_at: new Date().toISOString(),
            error_message: error
          })
        if (activityLogError) {
          console.error(`[batch-update-sync] ERROR inserting failed activity log:`, activityLogError.message)
        }
        continue
      }

      try {
        if (isNewsOnly) {
          // NEWS ONLY: Process news data
          let newsItems: any[] = []
          
          if (Array.isArray(webhookData) && webhookData.length > 0) {
            const firstItem = webhookData[0]
            if (firstItem.news_research_raw?.news_and_updates) {
              newsItems = firstItem.news_research_raw.news_and_updates
            } else if (firstItem.news) {
              newsItems = firstItem.news
            }
          } else if (webhookData.news_research_raw?.news_and_updates) {
            newsItems = webhookData.news_research_raw.news_and_updates
          } else if (webhookData.news) {
            newsItems = webhookData.news
          }

          console.log(`[batch-update-sync] Found ${newsItems.length} news items in webhook response for ${entity.domain}`)

          if (newsItems.length > 0) {
            const config = entityConfig[entity.entityType as keyof typeof entityConfig]
            
            // Get existing news URLs to avoid duplicates
            const { data: existingNews, error: fetchNewsError } = await supabase
              .from(config.marketNewsTable)
              .select('url')
              .eq(config.fkColumn, entity.id)
            
            if (fetchNewsError) {
              console.error(`[batch-update-sync] ERROR fetching existing news:`, fetchNewsError.message)
            }
            
            const existingUrls = new Set((existingNews || []).map((n: any) => n.url).filter(Boolean))
            console.log(`[batch-update-sync] Found ${existingUrls.size} existing news URLs for ${entity.domain}`)
            
            const newNews = newsItems.filter((item: any) => {
              const url = item.url || item.link
              return url && !existingUrls.has(url)
            })

            console.log(`[batch-update-sync] ${newNews.length} new news items to insert for ${entity.domain}`)

            if (newNews.length > 0) {
              const newsToInsert = newNews.map((item: any) => ({
                [config.fkColumn]: entity.id,
                title: item.title || item.titulo || null,
                url: item.url || item.link || null,
                date: item.date || item.data || null,
                summary: item.summary || item.resumo || item.description || null,
                classification: item.classification || item.classificacao || item.type || item.tipo || null,
              }))

              console.log(`[batch-update-sync] Inserting ${newsToInsert.length} news items into ${config.marketNewsTable}...`)
              console.log(`[batch-update-sync] Sample news item:`, JSON.stringify(newsToInsert[0], null, 2))
              
              const { error: insertNewsError } = await supabase.from(config.marketNewsTable).insert(newsToInsert)
              
              if (insertNewsError) {
                console.error(`[batch-update-sync] ERROR inserting news for ${entity.domain}:`, insertNewsError.message, insertNewsError.code, insertNewsError.details)
                throw new Error(`Failed to insert news: ${insertNewsError.message}`)
              } else {
                console.log(`[batch-update-sync] Successfully added ${newsToInsert.length} news for ${entity.domain}`)
              }
            } else {
              console.log(`[batch-update-sync] No new news to insert for ${entity.domain} (all already exist)`)
            }
          } else {
            console.log(`[batch-update-sync] No news items found in webhook response for ${entity.domain}`)
          }
        } else if (isContentNews) {
          // CONTENT & NEWS: Process social media, Glassdoor, and news data
          let parsedData: any
          if (Array.isArray(webhookData) && webhookData.length > 0) {
            parsedData = webhookData[0]
          } else {
            parsedData = webhookData
          }
          const actualData = parsedData.json ? parsedData.json : parsedData;

          const config = entityConfig[entity.entityType as keyof typeof entityConfig]
          const redes_sociais = actualData.redes_sociais || {
            linkedin: { posts: actualData.linkedin_posts },
            instagram: { posts: actualData.instagram_posts },
            youtube: actualData.youtube_info 
          };
          const mercado = actualData.mercado || actualData.market_research_raw || {};
          const glassdoor = actualData.glassdoor_info || (redes_sociais?.glassdoor || actualData.glassdoor);

          // Save Glassdoor data
          if (glassdoor && (glassdoor.overall_rating || glassdoor.rating)) {
            const glassdoorBase = {
              [config.glassdoorFk]: entity.id,
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
            }
            
            const { error: deleteGlassdoorError } = await supabase.from(config.glassdoorTable).delete().eq(config.glassdoorFk, entity.id)
            if (deleteGlassdoorError) {
              console.error(`[batch-update-sync] ERROR deleting Glassdoor:`, deleteGlassdoorError.message)
            }
            
            const { error: insertGlassdoorError } = await supabase.from(config.glassdoorTable).insert(glassdoorBase)
            if (insertGlassdoorError) {
              console.error(`[batch-update-sync] ERROR inserting Glassdoor:`, insertGlassdoorError.message, insertGlassdoorError.code)
            } else {
              console.log(`[batch-update-sync] Saved Glassdoor data for ${entity.domain}`)
            }
          }

          // Save LinkedIn posts
          if (redes_sociais?.linkedin?.posts?.length > 0) {
            const { error: deleteLinkedinError } = await supabase.from(config.linkedinTable).delete().eq(config.fkColumn, entity.id)
            if (deleteLinkedinError) {
              console.error(`[batch-update-sync] ERROR deleting LinkedIn posts:`, deleteLinkedinError.message)
            }
            
            const posts = redes_sociais.linkedin.posts.map((post: any) => ({
              [config.fkColumn]: entity.id,
              external_id: post.id || null,
              text: post.text || null,
              url: post.url || null,
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
            }))
            
            const { error: insertLinkedinError } = await supabase.from(config.linkedinTable).insert(posts)
            if (insertLinkedinError) {
              console.error(`[batch-update-sync] ERROR inserting LinkedIn posts:`, insertLinkedinError.message, insertLinkedinError.code)
            } else {
              console.log(`[batch-update-sync] Saved ${posts.length} LinkedIn posts for ${entity.domain}`)
            }
          }

          // Save Instagram posts
          if (redes_sociais?.instagram?.posts?.length > 0) {
            const { error: deleteInstagramError } = await supabase.from(config.instagramTable).delete().eq(config.fkColumn, entity.id)
            if (deleteInstagramError) {
              console.error(`[batch-update-sync] ERROR deleting Instagram posts:`, deleteInstagramError.message)
            }
            
            const posts = redes_sociais.instagram.posts.map((post: any) => ({
              [config.fkColumn]: entity.id,
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
            }))
            
            const { error: insertInstagramError } = await supabase.from(config.instagramTable).insert(posts)
            if (insertInstagramError) {
              console.error(`[batch-update-sync] ERROR inserting Instagram posts:`, insertInstagramError.message, insertInstagramError.code)
            } else {
              console.log(`[batch-update-sync] Saved ${posts.length} Instagram posts for ${entity.domain}`)
            }
          }

          // Save YouTube videos
          if (redes_sociais?.youtube?.videos?.length > 0) {
            const { error: deleteYoutubeError } = await supabase.from(config.youtubeTable).delete().eq(config.fkColumn, entity.id)
            if (deleteYoutubeError) {
              console.error(`[batch-update-sync] ERROR deleting YouTube videos:`, deleteYoutubeError.message)
            }
            
            const videos = redes_sociais.youtube.videos.map((video: any) => ({
              [config.fkColumn]: entity.id,
              external_id: video.id || null,
              title: video.title || null,
              url: video.url || null,
              thumbnail_url: video.thumbnailUrl || video.thumbnail || null,
              view_count: video.viewCount || video.views || 0,
              likes: video.likes || 0,
              comments_count: video.commentsCount || video.comments || 0,
              published_at: video.publishedAt || video.published_at || null,
            }))
            
            const { error: insertYoutubeError } = await supabase.from(config.youtubeTable).insert(videos)
            if (insertYoutubeError) {
              console.error(`[batch-update-sync] ERROR inserting YouTube videos:`, insertYoutubeError.message, insertYoutubeError.code)
            } else {
              console.log(`[batch-update-sync] Saved ${videos.length} YouTube videos for ${entity.domain}`)
            }
          }

          // Save Market News (additive)
          if (mercado?.news_and_actions?.length > 0) {
            const { data: existingNews, error: fetchNewsError } = await supabase
              .from(config.marketNewsTable)
              .select('url')
              .eq(config.fkColumn, entity.id)
            
            if (fetchNewsError) {
              console.error(`[batch-update-sync] ERROR fetching existing news:`, fetchNewsError.message)
            }
            
            const existingUrls = new Set((existingNews || []).map((n: any) => n.url).filter(Boolean))
            
            const newNews = mercado.news_and_actions.filter((item: any) => {
              const url = item.url
              return url && !existingUrls.has(url)
            })

            if (newNews.length > 0) {
              const newsToInsert = newNews.map((n: any) => ({
                [config.fkColumn]: entity.id,
                title: n.titulo || n.title || null,
                url: n.url || null,
                date: n.data || n.date || null,
                summary: n.resumo || n.summary || null,
                classification: n.tipo || n.classification || n.classificacao || null,
              }))
              
              console.log(`[batch-update-sync] Inserting ${newsToInsert.length} news items for ${entity.domain}...`)
              const { error: insertNewsError } = await supabase.from(config.marketNewsTable).insert(newsToInsert)
              
              if (insertNewsError) {
                console.error(`[batch-update-sync] ERROR inserting news:`, insertNewsError.message, insertNewsError.code, insertNewsError.details)
                throw new Error(`Failed to insert news: ${insertNewsError.message}`)
              } else {
                console.log(`[batch-update-sync] Successfully added ${newsToInsert.length} news for ${entity.domain}`)
              }
            }
          }
        } else {
          // FULL UPDATE: Parse and save all data
          let parsedData: any
          if (Array.isArray(webhookData) && webhookData.length > 0) {
            parsedData = webhookData[0]
          } else {
            parsedData = webhookData
          }
          const actualData = parsedData.json ? parsedData.json : parsedData;

          const hasOverview = actualData.overview || actualData.linkedin_info || actualData.company;

          if (!hasOverview) {
            console.warn(`[batch-update-sync] No overview data for ${entity.domain}, skipping...`)
            failedEntities.push(entity.domain)
            continue
          }

          await saveEntityData(supabase, entity.id, actualData, entity.entityType)
        }
        
        entitiesUpdated++
        console.log(`[batch-update-sync] Successfully updated ${entity.domain}`)

        // Create notification
        const entityTypeLabel = entity.entityType === 'competitor' ? 'Concorrente' : 
                               entity.entityType === 'prospect' ? 'Prospect' : 'Cliente'
        const detailUrl = entity.entityType === 'competitor' ? `/competitor/${entity.id}` :
                         entity.entityType === 'prospect' ? `/prospect/${entity.id}` : `/client/${entity.id}`
        const notificationLabel = isNewsOnly ? 'Notícias atualizadas' : (isContentNews ? 'Conteúdos atualizados' : 'Atualização concluída')

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: user_id,
            title: notificationLabel,
            message: `${entityTypeLabel} "${entity.name || entity.domain}" foi atualizado com sucesso.`,
            type: 'success',
            action_url: detailUrl
          })
        
        if (notificationError) {
          console.error(`[batch-update-sync] ERROR inserting notification:`, notificationError.message, notificationError.code)
        }

        // Save activity log
        const { error: activityLogError } = await supabase
          .from('analysis_activity_log')
          .insert({
            user_id: user_id,
            batch_log_id: log_id,
            entity_id: entity.id,
            entity_type: entity.entityType,
            entity_name: entity.name,
            entity_domain: entity.domain,
            trigger_type: trigger_type,
            update_type: update_type,
            status: 'success',
            started_at: startTime.toISOString(),
            completed_at: new Date().toISOString(),
            duration_seconds: duration
          })
        
        if (activityLogError) {
          console.error(`[batch-update-sync] ERROR inserting activity log:`, activityLogError.message, activityLogError.code)
        }

      } catch (processingError) {
        console.error(`[batch-update-sync] Error processing data for ${entity.domain}:`, processingError)
        failedEntities.push(entity.domain)
        
        const { error: failedLogError } = await supabase
          .from('analysis_activity_log')
          .insert({
            user_id: user_id,
            batch_log_id: log_id,
            entity_id: entity.id,
            entity_type: entity.entityType,
            entity_name: entity.name,
            entity_domain: entity.domain,
            trigger_type: trigger_type,
            update_type: update_type,
            status: 'failed',
            started_at: startTime.toISOString(),
            completed_at: new Date().toISOString(),
            error_message: processingError instanceof Error ? processingError.message : 'Unknown error'
          })
        
        if (failedLogError) {
          console.error(`[batch-update-sync] ERROR inserting failed activity log:`, failedLogError.message)
        }
      }
    }

    // Mark as COMPLETED
    if (log_id) {
      const { error: updateLogError } = await supabase
        .from('update_logs')
        .update({ 
          status: 'completed',
          entities_updated: entitiesUpdated,
          completed_at: new Date().toISOString(),
          current_entity_name: null,
          current_entity_domain: null,
          error_message: failedEntities.length > 0 ? `Falha em: ${failedEntities.join(', ')}` : null
        })
        .eq('id', log_id)
      
      if (updateLogError) {
        console.error(`[batch-update-sync] ERROR updating log:`, updateLogError.message)
      }
    }

    // Create summary notification
    const summaryTitle = isNewsOnly ? 'Atualização de notícias concluída' : 'Atualização em lote concluída'
    const { error: summaryNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        title: summaryTitle,
        message: `${entitiesUpdated} de ${allEntities.length} entidades atualizadas com sucesso.`,
        type: entitiesUpdated === allEntities.length ? 'success' : 'warning',
        action_url: '/settings'
      })
    
    if (summaryNotificationError) {
      console.error(`[batch-update-sync] ERROR inserting summary notification:`, summaryNotificationError.message)
    }

    // Update settings with last update time and calculate next update
    const { data: settings } = await supabase
      .from('update_settings')
      .select('frequency_minutes')
      .eq('user_id', user_id)
      .single()

    if (settings) {
      const nextUpdate = new Date()
      nextUpdate.setMinutes(nextUpdate.getMinutes() + settings.frequency_minutes)

      const { error: updateSettingsError } = await supabase
        .from('update_settings')
        .update({
          last_update_at: new Date().toISOString(),
          next_update_at: nextUpdate.toISOString()
        })
        .eq('user_id', user_id)
      
      if (updateSettingsError) {
        console.error(`[batch-update-sync] ERROR updating settings:`, updateSettingsError.message)
      }
    }

    console.log(`[batch-update-sync] Completed. Updated ${entitiesUpdated}/${allEntities.length} entities`)

    return new Response(
      JSON.stringify({
        success: true,
        total: allEntities.length,
        updated: entitiesUpdated,
        failed: failedEntities
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('[batch-update-sync] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
