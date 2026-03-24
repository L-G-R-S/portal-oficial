import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";


// Webhook secret for validating incoming requests from N8N
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') || '';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ SECURITY: Validate Webhook Origin ============
    // This endpoint is called by N8N webhook, not directly by users
    // We validate either via webhook secret OR via JWT if called internally
    
    const webhookSecret = req.headers.get('x-webhook-secret');
    const authHeader = req.headers.get('Authorization');
    
    // If webhook secret is configured, validate it
    if (WEBHOOK_SECRET && webhookSecret !== WEBHOOK_SECRET) {
      // If no valid webhook secret, try JWT validation as fallback
      if (!authHeader?.startsWith('Bearer ')) {
        console.error('[process-company-data] Unauthorized: No valid webhook secret or JWT');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid webhook secret' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Validate JWT
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: authError } = await userClient.auth.getUser(token);
      
      if (authError || !userData.user) {
        console.error('[process-company-data] Invalid token:', authError?.message);
        return new Response(
          JSON.stringify({ error: 'Unauthorized - Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`[process-company-data] Authenticated via JWT: ${userData.user.id}`);
    } else if (WEBHOOK_SECRET) {
      console.log('[process-company-data] Authenticated via webhook secret');
    } else {
      // No webhook secret configured - log warning but allow (for backward compatibility)
      console.warn('[process-company-data] WARNING: No WEBHOOK_SECRET configured - request allowed without validation');
    }
    // ============ END SECURITY ============

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload = await req.json();
    console.log("[process-company-data] Received payload");

    // Extract metadata for batch update tracking
    const log_id = payload.log_id || null;
    const user_id = payload.user_id || null;
    const entity_type = payload.entity_type || 'competitor';

    // Payload pode ser array de empresas ou objeto único com dados
    let companies: any[];
    if (Array.isArray(payload)) {
      companies = payload;
    } else if (payload.overview || payload.redes_sociais) {
      companies = [payload];
    } else if (payload.data) {
      companies = Array.isArray(payload.data) ? payload.data : [payload.data];
    } else {
      companies = [payload];
    }

    let processedCount = 0;
    let lastCompanyId: string | null = null;
    let lastCompanyName: string | null = null;
    let lastDomain: string | null = null;

    for (const companyData of companies) {
      const { overview, redes_sociais, mercado } = companyData;
      
      // Glassdoor now comes inside redes_sociais in new structure
      const glassdoor = redes_sociais?.glassdoor || companyData.glassdoor;

      const domain = overview?.dominio || companyData.domain;

      if (!domain) {
        console.error("[process-company-data] Domain is required");
        continue;
      }

      lastDomain = domain;

      // Determine which table to use based on entity_type
      const mainTable = entity_type === 'prospect' ? 'prospects' : 
                       entity_type === 'client' ? 'clients' : 'companies';
      
      const linkedinTable = entity_type === 'prospect' ? 'prospect_linkedin_posts' : 
                           entity_type === 'client' ? 'client_linkedin_posts' : 'linkedin_posts';
      
      const instagramTable = entity_type === 'prospect' ? 'prospect_instagram_posts' : 
                            entity_type === 'client' ? 'client_instagram_posts' : 'instagram_posts';
      
      const youtubeTable = entity_type === 'prospect' ? 'prospect_youtube_videos' : 
                          entity_type === 'client' ? 'client_youtube_videos' : 'youtube_videos';
      
      const leadershipTable = entity_type === 'prospect' ? 'prospect_leadership' : 
                             entity_type === 'client' ? 'client_leadership' : 'company_leadership';
      
      const glassdoorTable = entity_type === 'prospect' ? 'prospect_glassdoor_summary' : 
                            entity_type === 'client' ? 'client_glassdoor_summary' : 'glassdoor_summary';
      
      const similarTable = entity_type === 'prospect' ? 'prospect_similar_companies' : 
                          entity_type === 'client' ? 'client_similar_companies' : 'similar_companies';
      
      const newsTable = entity_type === 'prospect' ? 'prospect_market_news' : 
                       entity_type === 'client' ? 'client_market_news' : 'market_news';
      
      const researchTable = entity_type === 'prospect' ? 'prospect_market_research' : 
                           entity_type === 'client' ? 'client_market_research' : 'market_research';
      
      const entityIdColumn = entity_type === 'prospect' ? 'prospect_id' : 
                            entity_type === 'client' ? 'client_id' : 'company_id';

      // 1. Upsert company data
      const companyRecord = {
        domain: domain,
        name: overview?.nome || null,
        website: overview?.website || overview?.site_institucional || overview?.positioning?.presenca_digital?.site_institucional || `https://${domain}`,
        description: overview?.descricao_institucional || null,
        industry: overview?.setor || null,
        logo_url: overview?.logo_url || null,
        address: overview?.endereco || null,
        phone: overview?.telefone || null,
        headquarters: redes_sociais?.linkedin?.headquarters || null,
        year_founded: redes_sociais?.linkedin?.founded
          ? parseInt(redes_sociais.linkedin.founded)
          : null,
        size: redes_sociais?.linkedin?.company_size || null,
        market: overview?.mercado_alvo || null,
        business_model: overview?.modelo_negocio || null,
        products_services: overview?.produtos_servicos || null,
        differentiators: overview?.diferenciais || null,
        partners: overview?.parceiros || null,
        clients: overview?.clientes_citados || null,
        linkedin_url: redes_sociais?.linkedin?.url || null,
        instagram_url: redes_sociais?.instagram?.profileUrl || null,
        youtube_url: redes_sociais?.youtube?.channel_url || null,
        linkedin_followers: redes_sociais?.linkedin?.followers || null,
        linkedin_specialties: redes_sociais?.linkedin?.specialties || null,
        instagram_username: redes_sociais?.instagram?.username || null,
        instagram_followers: redes_sociais?.instagram?.profile?.followersCount || null,
        instagram_follows: redes_sociais?.instagram?.profile?.followsCount || null,
        instagram_posts_count: redes_sociais?.instagram?.profile?.postsCount || null,
        youtube_channel_name: redes_sociais?.youtube?.channel_name || null,
        youtube_subscribers: redes_sociais?.youtube?.subscriber_count || null,
        employee_count: redes_sociais?.linkedin?.employee_count || null,
      };

      const { data: existingCompany, error: checkError } = await supabase
        .from(mainTable)
        .select("id, name")
        .eq("domain", domain)
        .maybeSingle();

      if (checkError) {
        console.error(`[process-company-data] Error checking ${mainTable}:`, checkError);
        continue;
      }

      let companyId: string;

      if (existingCompany) {
        const { error: updateError } = await supabase
          .from(mainTable)
          .update(companyRecord)
          .eq("id", existingCompany.id);

        if (updateError) {
          console.error(`[process-company-data] Error updating ${mainTable}:`, updateError);
          continue;
        }
        companyId = existingCompany.id;
        lastCompanyName = overview?.nome || existingCompany.name;
      } else {
        const { data: newCompany, error: insertError } = await supabase
          .from(mainTable)
          .insert(companyRecord)
          .select("id")
          .single();

        if (insertError) {
          console.error(`[process-company-data] Error inserting ${mainTable}:`, insertError);
          continue;
        }
        companyId = newCompany.id;
        lastCompanyName = overview?.nome;
      }

      lastCompanyId = companyId;
      console.log(`[process-company-data] ${mainTable} saved with ID: ${companyId}`);

      // 2. Process LinkedIn posts (UPSERT to preserve history)
      if (redes_sociais?.linkedin?.posts?.length > 0) {
        const linkedinPosts = redes_sociais.linkedin.posts
          .filter((post: any) => post.id) // Only posts with external_id
          .map((post: any) => ({
            [entityIdColumn]: companyId,
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
          }));

        if (linkedinPosts.length > 0) {
          const { error: linkedinError } = await supabase
            .from(linkedinTable)
            .upsert(linkedinPosts, { 
              onConflict: `${entityIdColumn},external_id`,
              ignoreDuplicates: false 
            });

          if (linkedinError) {
            console.error("[process-company-data] Error upserting LinkedIn posts:", linkedinError);
          } else {
            console.log(`[process-company-data] Upserted ${linkedinPosts.length} LinkedIn posts`);
          }
        }
      }

      // 3. Process Instagram posts (UPSERT to preserve history)
      if (redes_sociais?.instagram?.posts?.length > 0) {
        const instagramPosts = redes_sociais.instagram.posts
          .filter((post: any) => post.id) // Only posts with external_id
          .map((post: any) => ({
            [entityIdColumn]: companyId,
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
          }));

        if (instagramPosts.length > 0) {
          const { error: instagramError } = await supabase
            .from(instagramTable)
            .upsert(instagramPosts, { 
              onConflict: `${entityIdColumn},external_id`,
              ignoreDuplicates: false 
            });

          if (instagramError) {
            console.error("[process-company-data] Error upserting Instagram posts:", instagramError);
          } else {
            console.log(`[process-company-data] Upserted ${instagramPosts.length} Instagram posts`);
          }
        }
      }

      // 4. Process YouTube videos (UPSERT to preserve history)
      if (redes_sociais?.youtube?.videos?.length > 0) {
        const youtubeVideos = redes_sociais.youtube.videos
          .filter((video: any) => video.id) // Only videos with external_id
          .map((video: any) => ({
            [entityIdColumn]: companyId,
            external_id: video.id,
            title: video.title || null,
            url: video.url || null,
            thumbnail_url: video.thumbnail || null,
            view_count: video.views || 0,
            likes: video.likes || 0,
            comments_count: video.comments || 0,
            published_at: video.published_at || null,
          }));

        if (youtubeVideos.length > 0) {
          const { error: youtubeError } = await supabase
            .from(youtubeTable)
            .upsert(youtubeVideos, { 
              onConflict: `${entityIdColumn},external_id`,
              ignoreDuplicates: false 
            });

          if (youtubeError) {
            console.error("[process-company-data] Error upserting YouTube videos:", youtubeError);
          } else {
            console.log(`[process-company-data] Upserted ${youtubeVideos.length} YouTube videos`);
          }
        }
      }

      // 4.1 Cache images for LinkedIn and Instagram posts (async, non-blocking)
      const imagesToCache: Array<{ id: string; imageUrl: string; platform: 'linkedin' | 'instagram'; entityType: 'company' | 'prospect' | 'client' | 'primary' }> = [];
      
      // Map entity_type to the format expected by cache function
      const cacheEntityType = entity_type === 'prospect' ? 'prospect' : 
                              entity_type === 'client' ? 'client' : 'company';

      // Collect LinkedIn posts with images that need caching
      if (redes_sociais?.linkedin?.posts?.length > 0) {
        // First, get the saved post IDs from database
        const { data: savedLinkedinPosts } = await supabase
          .from(linkedinTable)
          .select('id, external_id, media_thumbnail, cached_thumbnail_url')
          .eq(entityIdColumn, companyId);
        
        if (savedLinkedinPosts) {
          for (const savedPost of savedLinkedinPosts) {
            // Only cache if has thumbnail and not already cached
            if (savedPost.media_thumbnail && !savedPost.cached_thumbnail_url) {
              imagesToCache.push({
                id: savedPost.id,
                imageUrl: savedPost.media_thumbnail,
                platform: 'linkedin',
                entityType: cacheEntityType as 'company' | 'prospect' | 'client'
              });
            }
          }
        }
      }

      // Collect Instagram posts with images that need caching
      if (redes_sociais?.instagram?.posts?.length > 0) {
        const { data: savedInstagramPosts } = await supabase
          .from(instagramTable)
          .select('id, external_id, thumbnail_url, media_url, cached_thumbnail_url')
          .eq(entityIdColumn, companyId);
        
        if (savedInstagramPosts) {
          for (const savedPost of savedInstagramPosts) {
            const imageUrl = savedPost.thumbnail_url || savedPost.media_url;
            // Only cache if has image and not already cached
            if (imageUrl && !savedPost.cached_thumbnail_url) {
              imagesToCache.push({
                id: savedPost.id,
                imageUrl: imageUrl,
                platform: 'instagram',
                entityType: cacheEntityType as 'company' | 'prospect' | 'client'
              });
            }
          }
        }
      }

      // Call cache function if there are images to cache
      if (imagesToCache.length > 0) {
        console.log(`[process-company-data] Caching ${imagesToCache.length} images...`);
        
        // Call the cache function (fire and forget to not block the response)
        fetch(`${supabaseUrl}/functions/v1/cache-post-images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ posts: imagesToCache }),
        }).then(async (response) => {
          if (response.ok) {
            const result = await response.json();
            console.log(`[process-company-data] Image caching result: ${result.cached} cached, ${result.failed} failed`);
          } else {
            console.error(`[process-company-data] Image caching failed: ${response.status}`);
          }
        }).catch((error) => {
          console.error(`[process-company-data] Image caching error:`, error);
        });
      }

      // 5. Process Leadership
      if (overview?.lideranca?.length > 0) {
        await supabase
          .from(leadershipTable)
          .delete()
          .eq(entityIdColumn, companyId);

        const leadership = overview.lideranca.map((leader: any) => ({
          [entityIdColumn]: companyId,
          name: leader.nome || null,
          position: leader.cargo || null,
          linkedin_url: leader.linkedin || null,
          source: leader.url_fonte || null,
        }));

        const { error: leadershipError } = await supabase
          .from(leadershipTable)
          .insert(leadership);

        if (leadershipError) {
          console.error("[process-company-data] Error inserting leadership:", leadershipError);
        } else {
          console.log(`[process-company-data] Inserted ${leadership.length} leadership records`);
        }
      }

      // 6. Process Glassdoor data
      if (glassdoor && (glassdoor.overall_rating || glassdoor.rating)) {
        await supabase
          .from(glassdoorTable)
          .delete()
          .eq(entityIdColumn, companyId);

        const glassdoorRecord = {
          [entityIdColumn]: companyId,
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

        const { error: glassdoorError } = await supabase
          .from(glassdoorTable)
          .insert(glassdoorRecord);

        if (glassdoorError) {
          console.error("[process-company-data] Error inserting Glassdoor data:", glassdoorError);
        } else {
          console.log("[process-company-data] Inserted Glassdoor data");
        }
      }

      // 7. Process Similar Companies (combined from overview and mercado to avoid duplicates)
      const allSimilarCompanies: any[] = [];
      const seenCompanyNames = new Set<string>();

      // Add from overview
      if (overview?.similar_companies?.length > 0) {
        for (const comp of overview.similar_companies) {
          const name = (comp.name || '').toLowerCase().trim();
          if (name && !seenCompanyNames.has(name)) {
            seenCompanyNames.add(name);
            allSimilarCompanies.push({
              [entityIdColumn]: companyId,
              name: comp.name || null,
              url: comp.url || null,
              industry: comp.industry || null,
              location: comp.location || null,
              logo_url: comp.logo_url || null,
              source: "overview",
            });
          }
        }
      }

      // Add from mercado (avoiding duplicates by name)
      if (mercado?.similar_companies?.length > 0) {
        for (const comp of mercado.similar_companies) {
          const name = (comp.name || '').toLowerCase().trim();
          if (name && !seenCompanyNames.has(name)) {
            seenCompanyNames.add(name);
            allSimilarCompanies.push({
              [entityIdColumn]: companyId,
              name: comp.name || null,
              url: comp.url || null,
              industry: comp.industry || null,
              location: comp.location || null,
              logo_url: comp.logo_url || null,
              source: "mercado",
            });
          }
        }
      }

      // Delete old and insert all combined similar companies
      if (allSimilarCompanies.length > 0) {
        await supabase
          .from(similarTable)
          .delete()
          .eq(entityIdColumn, companyId);

        const { error: similarError } = await supabase
          .from(similarTable)
          .insert(allSimilarCompanies);

        if (similarError) {
          console.error("[process-company-data] Error inserting similar companies:", similarError);
        } else {
          console.log(`[process-company-data] Inserted ${allSimilarCompanies.length} deduplicated similar companies`);
        }
      }

      // 9. Process News and Actions from mercado (combined to avoid duplicates)
      // Collect all news from both sources
      const allNewsItems: any[] = [];
      const seenUrls = new Set<string>();
      
      // Add news from mercado.news_and_actions
      if (mercado?.news_and_actions?.length > 0) {
        for (const news of mercado.news_and_actions) {
          const url = news.url || '';
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            allNewsItems.push({
              [entityIdColumn]: companyId,
              title: news.titulo || null,
              url: news.url || null,
              date: news.data || null,
              summary: news.resumo || null,
              classification: news.tipo || news.classificacao || null,
            });
          }
        }
      }
      
      // Add public actions from positioning (avoiding duplicates)
      if (overview?.positioning?.acoes_publicas?.length > 0) {
        for (const action of overview.positioning.acoes_publicas) {
          const url = action.url || '';
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            allNewsItems.push({
              [entityIdColumn]: companyId,
              title: action.titulo || null,
              url: action.url || null,
              date: action.data || null,
              summary: action.resumo || null,
              classification: action.tipo || "acao_publica",
            });
          }
        }
      }
      
      // Delete old news and insert all combined
      if (allNewsItems.length > 0) {
        await supabase
          .from(newsTable)
          .delete()
          .eq(entityIdColumn, companyId);

        const { error: newsError } = await supabase
          .from(newsTable)
          .insert(allNewsItems);

        if (newsError) {
          console.error("[process-company-data] Error inserting news:", newsError);
        } else {
          console.log(`[process-company-data] Inserted ${allNewsItems.length} news records (deduplicated)`);
        }
      }

      // 10. Process Market Research
      await supabase
        .from(researchTable)
        .delete()
        .eq(entityIdColumn, companyId);

      const marketResearchRecord = {
        [entityIdColumn]: companyId,
        institutional_discourse: overview?.positioning?.discurso_institucional || null,
        recurring_topics: overview?.positioning?.topicos_recorrentes || null,
        digital_presence: overview?.positioning?.presenca_digital || null,
        public_actions: overview?.positioning?.acoes_publicas || null,
        institutional_curiosities: overview?.curiosidades_institucionais || null,
        strategic_analysis: overview?.overall_analysis || null,
        swot_analysis: mercado?.analises || null,
        events: mercado?.eventos || [],
        source_references: Array.isArray(overview?.references) 
          ? overview.references.join(", ") 
          : overview?.references || null,
      };

      const { error: marketResearchError } = await supabase
        .from(researchTable)
        .insert(marketResearchRecord);

      if (marketResearchError) {
        console.error("[process-company-data] Error inserting market research:", marketResearchError);
      } else {
        console.log("[process-company-data] Inserted market research data");
      }

      processedCount++;
    }

    // CLOSE THE LOOP: Mark update_log as completed and create notification
    // Try to find log_id via fallback if not provided
    let effectiveLogId = log_id;
    let effectiveUserId = user_id;

    // Fallback: if no log_id provided, try to find the most recent dispatched log for this domain
    if (!effectiveLogId && lastDomain) {
      console.log(`[process-company-data] No log_id provided, attempting fallback lookup for domain: ${lastDomain}`);
      
      const { data: dispatchedLogs } = await supabase
        .from('update_logs')
        .select('id, user_id')
        .eq('status', 'dispatched')
        .order('started_at', { ascending: false })
        .limit(1);

      if (dispatchedLogs && dispatchedLogs.length > 0) {
        effectiveLogId = dispatchedLogs[0].id;
        effectiveUserId = effectiveUserId || dispatchedLogs[0].user_id;
        console.log(`[process-company-data] Fallback found log_id: ${effectiveLogId}`);
      }
    }

    if (effectiveLogId && effectiveUserId && processedCount > 0) {
      console.log(`[process-company-data] Closing update loop for log_id: ${effectiveLogId}`);
      
      // Check current status of log
      const { data: logData } = await supabase
        .from('update_logs')
        .select('entities_updated, total_entities, status')
        .eq('id', effectiveLogId)
        .single();

      // Only update if log is still dispatched (not already completed/cancelled/timeout)
      if (logData && logData.status === 'dispatched') {
        const currentUpdated = (logData?.entities_updated || 0) + processedCount;
        const totalEntities = logData?.total_entities || processedCount;
        const isComplete = currentUpdated >= totalEntities;

        // Update log progress
        const updateData: any = {
          entities_updated: currentUpdated,
        };

        if (isComplete) {
          updateData.status = 'completed';
          updateData.completed_at = new Date().toISOString();
        }

        const { error: logUpdateError } = await supabase
          .from('update_logs')
          .update(updateData)
          .eq('id', effectiveLogId);

        if (logUpdateError) {
          console.error("[process-company-data] Error updating log:", logUpdateError);
        } else {
          console.log(`[process-company-data] Log updated: ${currentUpdated}/${totalEntities}`);
        }

        // Create completion notification for this entity
        const entityName = lastCompanyName || lastDomain || 'Entidade';
        const entityTypeLabel = entity_type === 'competitor' ? 'Concorrente' : 
                               entity_type === 'prospect' ? 'Prospect' : 'Cliente';
        const actionUrl = entity_type === 'competitor' ? `/competitor/${lastCompanyId}` : 
                         entity_type === 'prospect' ? `/prospect/${lastCompanyId}` : `/client/${lastCompanyId}`;

        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: effectiveUserId,
            title: `${entityTypeLabel} atualizado`,
            message: `${entityName} foi atualizado com sucesso.`,
            type: 'success',
            action_url: actionUrl,
            action_data: { entity_id: lastCompanyId, entity_type: entity_type }
          });

        if (notifError) {
          console.error("[process-company-data] Error creating notification:", notifError);
        } else {
          console.log(`[process-company-data] Notification created for ${entityName}`);
        }

        // If all entities are done, create summary notification
        if (isComplete) {
          const { error: summaryError } = await supabase
            .from('notifications')
            .insert({
              user_id: effectiveUserId,
              title: 'Atualização em lote concluída',
              message: `${currentUpdated} ${currentUpdated === 1 ? 'entidade foi atualizada' : 'entidades foram atualizadas'} com sucesso.`,
              type: 'success',
              action_url: '/settings',
              action_data: { log_id: effectiveLogId, total_updated: currentUpdated }
            });

          if (summaryError) {
            console.error("[process-company-data] Error creating summary notification:", summaryError);
          } else {
            console.log("[process-company-data] Summary notification created");
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Data processed successfully", processed: processedCount }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[process-company-data] Error processing data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});