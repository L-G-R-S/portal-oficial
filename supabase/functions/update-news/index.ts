import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";


const WEBHOOK_URL = "https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/newsupdater";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ SECURITY: Validate JWT Authentication ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[update-news] Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // First validate the user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await userClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('[update-news] Invalid token:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Extract user_id from JWT, NOT from request body
    const user_id = userData.user.id;
    console.log(`[update-news] Authenticated user: ${user_id}`);
    // ============ END SECURITY ============

    // Use service role for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only extract entityId, domain, entityType from body (not user_id for security)
    const { entityId, domain, entityType } = await req.json();

    // Call N8N webhook and await response
    console.log(`[update-news] Calling N8N webhook for domain: ${domain}`);
    
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
    }

    // Handle empty response
    const responseText = await webhookResponse.text();
    console.log(`[update-news] Raw response: ${responseText.substring(0, 500)}`);
    
    if (!responseText || responseText.trim() === '') {
      console.log('[update-news] Empty response from webhook');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Webhook retornou resposta vazia - aguardando processamento',
          updated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let webhookData;
    try {
      webhookData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[update-news] Failed to parse JSON response:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Resposta do webhook não é JSON válido',
          updated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[update-news] Parsed response:`, JSON.stringify(webhookData).substring(0, 500));

    // Extract news from response - handle the news_research_raw.news_and_updates structure
    let newsItems: any[] = [];
    
    if (Array.isArray(webhookData)) {
      // Response is array - check first item for news_research_raw
      if (webhookData.length > 0) {
        const firstItem = webhookData[0];
        if (firstItem.news_research_raw?.news_and_updates) {
          newsItems = firstItem.news_research_raw.news_and_updates;
        } else if (firstItem.news) {
          newsItems = firstItem.news;
        } else if (firstItem.title) {
          // Direct array of news items
          newsItems = webhookData;
        }
      }
    } else if (webhookData.news_research_raw?.news_and_updates) {
      newsItems = webhookData.news_research_raw.news_and_updates;
    } else if (webhookData.news) {
      newsItems = webhookData.news;
    }

    console.log(`[update-news] Found ${newsItems.length} news items to process`);

    if (newsItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No news items returned from webhook',
          updated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine the correct table based on entity type
    let tableName: string;
    let idColumn: string;

    switch (entityType) {
      case 'competitor':
        tableName = 'market_news';
        idColumn = 'company_id';
        break;
      case 'prospect':
        tableName = 'prospect_market_news';
        idColumn = 'prospect_id';
        break;
      case 'client':
        tableName = 'client_market_news';
        idColumn = 'client_id';
        break;
      case 'primary':
        tableName = 'primary_company_market_news';
        idColumn = 'primary_company_id';
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    // Fetch existing news URLs to avoid duplicates (NOT deleting old news)
    console.log(`[update-news] Fetching existing news URLs from ${tableName} for ${idColumn}=${entityId}`);
    const { data: existingNews, error: fetchError } = await supabase
      .from(tableName)
      .select('url')
      .eq(idColumn, entityId);

    if (fetchError) {
      console.error(`[update-news] Error fetching existing news:`, fetchError);
    }

    // Normalize URLs for comparison (case-insensitive, trimmed)
    const normalizeUrl = (url: string | null | undefined): string => {
      if (!url) return '';
      return url.toLowerCase().trim();
    };

    const existingUrls = new Set(
      (existingNews || [])
        .map((n: any) => normalizeUrl(n.url))
        .filter(Boolean)
    );
    console.log(`[update-news] Found ${existingUrls.size} existing news URLs`);

    // Filter out duplicates by URL (case-insensitive comparison)
    const newNewsItems = newsItems.filter((item: any) => {
      const url = normalizeUrl(item.url || item.link);
      return url && !existingUrls.has(url);
    });

    console.log(`[update-news] ${newNewsItems.length} new news items after filtering duplicates`);

    if (newNewsItems.length === 0) {
      // Create notification even if no new news (inform user)
      if (user_id) {
        await supabase.from('notifications').insert({
          user_id,
          title: 'Notícias atualizadas',
          message: `Nenhuma notícia nova encontrada para ${domain}`,
          type: 'info',
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhuma notícia nova encontrada',
          updated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert only new news items (keeping old ones)
    const newsToInsert = newNewsItems.map((item: any) => ({
      [idColumn]: entityId,
      title: item.title || item.titulo || null,
      url: item.url || item.link || null,
      date: item.date || item.data || null,
      summary: item.summary || item.resumo || item.description || null,
      classification: item.classification || item.classificacao || item.type || item.tipo || null,
    }));

    console.log(`[update-news] Inserting ${newsToInsert.length} new news items into ${tableName}`);
    
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(newsToInsert);

    if (insertError) {
      console.error(`[update-news] Error inserting news:`, insertError);
      throw new Error(`Failed to insert news: ${insertError.message}`);
    }

    console.log(`[update-news] Successfully added ${newsToInsert.length} new news items for ${domain}`);

    // Create notification for the user (bell icon)
    if (user_id) {
      // Get entity name for better notification
      let entityName = domain;
      try {
        let entityTable: string;
        if (entityType === 'competitor') {
          entityTable = 'companies';
        } else if (entityType === 'prospect') {
          entityTable = 'prospects';
        } else if (entityType === 'client') {
          entityTable = 'clients';
        } else {
          entityTable = 'primary_company';
        }
        const { data: entityData } = await supabase
          .from(entityTable)
          .select('name')
          .eq('id', entityId)
          .single();
        if (entityData?.name) {
          entityName = entityData.name;
        }
      } catch (e) {
        // Ignore - use domain as fallback
      }

      let detailRoute: string;
      if (entityType === 'competitor') {
        detailRoute = 'competitor';
      } else if (entityType === 'primary') {
        detailRoute = 'primary-company';
      } else {
        detailRoute = entityType;
      }
      
      await supabase.from('notifications').insert({
        user_id,
        title: 'Notícias atualizadas',
        message: `${newsToInsert.length} nova(s) notícia(s) para ${entityName}`,
        type: 'success',
        action_url: `/${detailRoute}/${entityId}`,
      });
      console.log(`[update-news] Created notification for user ${user_id}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${newsToInsert.length} notícia(s) nova(s) adicionada(s)`,
        updated: newsToInsert.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[update-news] Error:', errorMessage);

    // Tentativa de registrar a falha na tela de notificações do usuário, se ele foi autenticado
    try {
      if (typeof req !== 'undefined') {
        const authHeader = req.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
          const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
          });
          const { data: { user } } = await userClient.auth.getUser();
          
          if (user) {
            const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase.from('notifications').insert({
              user_id: user.id,
              title: 'Falha na Atualização',
              message: `Erro ao buscar atualizações (n8n): ${errorMessage}`,
              type: 'error',
            });
          }
        }
      }
    } catch (notifyErr) {
      console.error('[update-news] Error sending error notification:', notifyErr);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
