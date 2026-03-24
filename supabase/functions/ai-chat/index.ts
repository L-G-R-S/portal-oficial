import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getGoogleAccessToken } from "./auth.ts";
import { corsHeaders } from "../_shared/cors.ts";


interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string | MultimodalContent[];
}

interface MultimodalContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
  };
}

interface FileContent {
  name: string;
  type: string;
  base64: string;
}

interface ChatRequest {
  message: string;
  entityId?: string;
  entityType?: "competitor" | "prospect" | "client" | "primary";
  conversationHistory?: ChatMessage[];
  files?: FileContent[];
}

// Helper to get table names based on entity type
function getTableNames(entityType: string) {
  switch (entityType) {
    case "competitor":
      return {
        main: "companies",
        glassdoor: "glassdoor_summary",
        marketResearch: "market_research",
        marketNews: "market_news",
        leadership: "company_leadership",
        linkedinPosts: "linkedin_posts",
        instagramPosts: "instagram_posts",
        youtubeVideos: "youtube_videos",
        similarCompanies: "company_competitors",
        idField: "company_id",
      };
    case "prospect":
      return {
        main: "prospects",
        glassdoor: "prospect_glassdoor_summary",
        marketResearch: "prospect_market_research",
        marketNews: "prospect_market_news",
        leadership: "prospect_leadership",
        linkedinPosts: "prospect_linkedin_posts",
        instagramPosts: "prospect_instagram_posts",
        youtubeVideos: "prospect_youtube_videos",
        similarCompanies: "prospect_similar_companies",
        idField: "prospect_id",
      };
    case "client":
      return {
        main: "clients",
        glassdoor: "client_glassdoor_summary",
        marketResearch: "client_market_research",
        marketNews: "client_market_news",
        leadership: "client_leadership",
        linkedinPosts: "client_linkedin_posts",
        instagramPosts: "client_instagram_posts",
        youtubeVideos: "client_youtube_videos",
        similarCompanies: "client_similar_companies",
        idField: "client_id",
      };
    case "primary":
      return {
        main: "primary_company",
        glassdoor: "primary_company_glassdoor",
        marketResearch: "primary_company_market_research",
        marketNews: "primary_company_market_news",
        leadership: "primary_company_leadership",
        linkedinPosts: "primary_company_linkedin_posts",
        instagramPosts: "primary_company_instagram_posts",
        youtubeVideos: "primary_company_youtube_videos",
        similarCompanies: "primary_company_similar_companies",
        idField: "primary_company_id",
      };
    default:
      return null;
  }
}

// Build context from entity data
async function buildEntityContext(
  supabase: any,
  entityId: string,
  entityType: string
): Promise<string> {
  const tables = getTableNames(entityType);
  if (!tables) return "";

  try {
    // Fetch main entity data
    const { data: entity } = await supabase
      .from(tables.main)
      .select("*")
      .eq("id", entityId)
      .single();

    if (!entity) return "";

    // Fetch related data in parallel
    const [
      { data: glassdoor },
      { data: marketResearch },
      { data: marketNews },
      { data: leadership },
      { data: linkedinPosts },
    ] = await Promise.all([
      supabase.from(tables.glassdoor).select("*").eq(tables.idField, entityId).limit(1),
      supabase.from(tables.marketResearch).select("*").eq(tables.idField, entityId).limit(1),
      supabase.from(tables.marketNews).select("*").eq(tables.idField, entityId).order("created_at", { ascending: false }).limit(10),
      supabase.from(tables.leadership).select("*").eq(tables.idField, entityId).limit(10),
      supabase.from(tables.linkedinPosts).select("*").eq(tables.idField, entityId).order("posted_at", { ascending: false }).limit(5),
    ]);

    // Build context string
    let context = `\n=== DADOS DA EMPRESA: ${entity.name || entity.domain} ===\n`;
    
    // Basic info
    context += `\n## Informações Básicas\n`;
    context += `- Nome: ${entity.name || "N/A"}\n`;
    context += `- Domínio: ${entity.domain || "N/A"}\n`;
    context += `- Indústria: ${entity.industry || entity.linkedin_industry || "N/A"}\n`;
    context += `- Setor: ${entity.sector || "N/A"}\n`;
    context += `- Localização: ${entity.headquarters || entity.hq_location || "N/A"}\n`;
    context += `- Tamanho: ${entity.size || "N/A"}\n`;
    context += `- Funcionários: ${entity.employee_count || "N/A"}\n`;
    context += `- Ano de fundação: ${entity.year_founded || "N/A"}\n`;
    context += `- Descrição: ${entity.description || entity.tagline || "N/A"}\n`;

    // Social media metrics
    context += `\n## Métricas de Redes Sociais\n`;
    context += `- LinkedIn Seguidores: ${entity.linkedin_followers?.toLocaleString() || "N/A"}\n`;
    context += `- Instagram Seguidores: ${entity.instagram_followers?.toLocaleString() || "N/A"}\n`;
    context += `- YouTube Inscritos: ${entity.youtube_subscribers?.toLocaleString() || "N/A"}\n`;
    context += `- YouTube Visualizações Totais: ${entity.youtube_total_views?.toLocaleString() || "N/A"}\n`;

    // Glassdoor data
    if (glassdoor?.[0]) {
      const g = glassdoor[0];
      context += `\n## Glassdoor\n`;
      context += `- Avaliação Geral: ${g.overall_rating || "N/A"}/5\n`;
      context += `- Recomendação: ${g.recommend_to_friend ? Math.round(g.recommend_to_friend * 100) + "%" : "N/A"}\n`;
      context += `- Aprovação CEO: ${g.ceo_rating ? Math.round(g.ceo_rating * 100) + "%" : "N/A"}\n`;
      context += `- Equilíbrio Vida/Trabalho: ${g.work_life_balance_rating || "N/A"}/5\n`;
      context += `- Cultura e Valores: ${g.culture_values_rating || "N/A"}/5\n`;
      context += `- Oportunidades de Carreira: ${g.career_opportunities_rating || "N/A"}/5\n`;
      context += `- Compensação e Benefícios: ${g.compensation_benefits_rating || "N/A"}/5\n`;
      if (g.pros_example) context += `- Pontos Positivos: ${g.pros_example}\n`;
      if (g.cons_example) context += `- Pontos Negativos: ${g.cons_example}\n`;
    }

    // Market research
    if (marketResearch?.[0]) {
      const m = marketResearch[0];
      context += `\n## Pesquisa de Mercado\n`;
      if (m.overall_analysis) context += `- Análise Geral: ${m.overall_analysis}\n`;
      if (m.central_message) context += `- Mensagem Central: ${m.central_message}\n`;
      if (m.positioning_discourse) context += `- Posicionamento: ${m.positioning_discourse}\n`;
      if (m.institutional_discourse) context += `- Discurso Institucional: ${m.institutional_discourse}\n`;
    }

    // Recent news with URLs
    if (marketNews?.length) {
      context += `\n## Notícias Recentes (últimas ${marketNews.length})\n`;
      marketNews.forEach((news: any, i: number) => {
        context += `${i + 1}. ${news.title || "Sem título"} (${news.date || "Data desconhecida"})\n`;
        if (news.summary) context += `   Resumo: ${news.summary}\n`;
        if (news.url) context += `   Link: ${news.url}\n`;
      });
    }

    // Leadership with LinkedIn URLs
    if (leadership?.length) {
      context += `\n## Pessoas Chaves (${leadership.length})\n`;
      leadership.forEach((person: any) => {
        context += `- ${person.name}: ${person.position || "Cargo não informado"}`;
        if (person.linkedin_url) {
          context += ` | LinkedIn: ${person.linkedin_url}`;
        }
        if (person.decision_level) {
          context += ` | Nível: ${person.decision_level}`;
        }
        context += `\n`;
      });
    }

    // Recent LinkedIn posts
    if (linkedinPosts?.length) {
      context += `\n## Posts Recentes do LinkedIn (últimos ${linkedinPosts.length})\n`;
      linkedinPosts.forEach((post: any, i: number) => {
        context += `${i + 1}. ${post.text?.substring(0, 200) || "Sem texto"}...\n`;
        context += `   Reações: ${post.total_reactions || 0}, Comentários: ${post.comments || 0}\n`;
      });
    }

    return context;
  } catch (error) {
    console.error("Error building entity context:", error);
    return "";
  }
}

// Build primary company context for the logged-in user
async function buildPrimaryCompanyContext(supabase: any, userId: string): Promise<string> {
  try {
    // Fetch user's primary company
    const { data: primaryCompany } = await supabase
      .from("primary_company")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!primaryCompany) return "";

    // Fetch ALL related data including leadership, news, and social posts
    const [
      { data: glassdoor },
      { data: marketResearch },
      { data: leadership },
      { data: marketNews },
      { data: linkedinPosts },
      { data: instagramPosts },
      { data: youtubeVideos },
    ] = await Promise.all([
      supabase.from("primary_company_glassdoor").select("*").eq("primary_company_id", primaryCompany.id).limit(1),
      supabase.from("primary_company_market_research").select("*").eq("primary_company_id", primaryCompany.id).limit(1),
      supabase.from("primary_company_leadership").select("*").eq("primary_company_id", primaryCompany.id).limit(20),
      supabase.from("primary_company_market_news").select("*").eq("primary_company_id", primaryCompany.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("primary_company_linkedin_posts").select("*").eq("primary_company_id", primaryCompany.id).order("posted_at", { ascending: false }).limit(5),
      supabase.from("primary_company_instagram_posts").select("*").eq("primary_company_id", primaryCompany.id).order("timestamp", { ascending: false }).limit(5),
      supabase.from("primary_company_youtube_videos").select("*").eq("primary_company_id", primaryCompany.id).order("published_at", { ascending: false }).limit(5),
    ]);

    let context = `\n=== SUA EMPRESA (PRIME CONTROL / EMPRESA PRINCIPAL): ${primaryCompany.name || primaryCompany.domain} ===\n`;
    
    context += `\n## Informações Básicas\n`;
    context += `- Nome: ${primaryCompany.name || "N/A"}\n`;
    context += `- Domínio: ${primaryCompany.domain || "N/A"}\n`;
    context += `- Indústria: ${primaryCompany.industry || primaryCompany.linkedin_industry || "N/A"}\n`;
    context += `- Setor: ${primaryCompany.sector || "N/A"}\n`;
    context += `- Localização: ${primaryCompany.headquarters || "N/A"}\n`;
    context += `- Funcionários: ${primaryCompany.employee_count || "N/A"}\n`;
    context += `- Descrição: ${primaryCompany.description || primaryCompany.tagline || "N/A"}\n`;
    context += `- Website: ${primaryCompany.website || "N/A"}\n`;
    context += `- LinkedIn: ${primaryCompany.linkedin_url || "N/A"}\n`;

    // Leadership / Key People section
    if (leadership?.length) {
      context += `\n## Pessoas-Chave da Sua Empresa (${leadership.length})\n`;
      leadership.forEach((person: any) => {
        context += `- **${person.name || "Nome não informado"}**: ${person.position || "Cargo não informado"}`;
        if (person.decision_level) context += ` (${person.decision_level})`;
        if (person.linkedin_url) context += ` | LinkedIn: ${person.linkedin_url}`;
        context += `\n`;
      });
    }

    context += `\n## Métricas de Redes Sociais\n`;
    context += `- LinkedIn Seguidores: ${primaryCompany.linkedin_followers?.toLocaleString() || "N/A"}\n`;
    context += `- Instagram Seguidores: ${primaryCompany.instagram_followers?.toLocaleString() || "N/A"}\n`;
    context += `- YouTube Inscritos: ${primaryCompany.youtube_subscribers?.toLocaleString() || "N/A"}\n`;

    if (glassdoor?.[0]) {
      const g = glassdoor[0];
      context += `\n## Glassdoor\n`;
      context += `- Avaliação Geral: ${g.overall_rating || "N/A"}/5\n`;
      context += `- Recomendação: ${g.recommend_to_friend ? Math.round(g.recommend_to_friend * 100) + "%" : "N/A"}\n`;
      context += `- Aprovação CEO: ${g.ceo_rating ? Math.round(g.ceo_rating * 100) + "%" : "N/A"}\n`;
    }

    if (marketResearch?.[0]) {
      const m = marketResearch[0];
      context += `\n## Pesquisa de Mercado\n`;
      if (m.overall_analysis) context += `- Análise Geral: ${m.overall_analysis}\n`;
      if (m.central_message) context += `- Mensagem Central: ${m.central_message}\n`;
      if (m.positioning_discourse) context += `- Posicionamento: ${m.positioning_discourse}\n`;
    }

    // Market News section
    if (marketNews?.length) {
      context += `\n## Notícias Recentes da Sua Empresa (${marketNews.length})\n`;
      marketNews.forEach((news: any) => {
        context += `- ${news.title || "Sem título"}`;
        if (news.date) context += ` (${new Date(news.date).toLocaleDateString("pt-BR")})`;
        if (news.url) context += ` | URL: ${news.url}`;
        context += `\n`;
        if (news.summary) context += `  Resumo: ${news.summary}\n`;
      });
    }

    // LinkedIn Posts section
    if (linkedinPosts?.length) {
      context += `\n## Últimos Posts LinkedIn da Sua Empresa (${linkedinPosts.length})\n`;
      linkedinPosts.forEach((post: any) => {
        const postDate = post.posted_at ? new Date(post.posted_at).toLocaleDateString("pt-BR") : "Data não informada";
        context += `- [${postDate}] ${post.text?.substring(0, 200) || "Sem texto"}...\n`;
        context += `  Reações: ${post.total_reactions || 0} | Comentários: ${post.comments || 0}\n`;
      });
    }

    // Instagram Posts section
    if (instagramPosts?.length) {
      context += `\n## Últimos Posts Instagram da Sua Empresa (${instagramPosts.length})\n`;
      instagramPosts.forEach((post: any) => {
        const postDate = post.timestamp ? new Date(post.timestamp).toLocaleDateString("pt-BR") : "Data não informada";
        context += `- [${postDate}] ${post.caption?.substring(0, 200) || "Sem legenda"}...\n`;
        context += `  Likes: ${post.likes_count || 0} | Comentários: ${post.comments_count || 0}\n`;
      });
    }

    // YouTube Videos section
    if (youtubeVideos?.length) {
      context += `\n## Últimos Vídeos YouTube da Sua Empresa (${youtubeVideos.length})\n`;
      youtubeVideos.forEach((video: any) => {
        const videoDate = video.published_at ? new Date(video.published_at).toLocaleDateString("pt-BR") : "Data não informada";
        context += `- [${videoDate}] ${video.title || "Sem título"}\n`;
        context += `  Views: ${video.view_count?.toLocaleString() || 0} | Likes: ${video.likes || 0}\n`;
        if (video.url) context += `  URL: ${video.url}\n`;
      });
    }

    return context;
  } catch (error) {
    console.error("Error building primary company context:", error);
    return "";
  }
}

// Build knowledge base context from user's stored documents with file URLs
async function buildKnowledgeBaseContext(supabase: any, userId: string): Promise<string> {
  try {
    const { data: documents } = await supabase
      .from("knowledge_documents")
      .select("id, file_name, file_type, file_size, storage_path, content_summary, extracted_text, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!documents?.length) return "";

    let context = `\n=== BASE DE CONHECIMENTO (DOCUMENTOS ARMAZENADOS) ===\n`;
    context += `Total de documentos: ${documents.length}\n\n`;

    for (const doc of documents) {
      // Generate signed URL for each document (valid for 1 hour)
      const { data: urlData } = await supabase.storage
        .from("chat-uploads")
        .createSignedUrl(doc.storage_path, 3600);
      
      const fileUrl = urlData?.signedUrl || "";
      const isImage = doc.file_type.startsWith("image/");
      const isPdf = doc.file_type === "application/pdf" || doc.file_name.endsWith(".pdf");
      
      context += `## Documento: ${doc.file_name}\n`;
      context += `- ID: ${doc.id}\n`;
      context += `- Tipo: ${isImage ? "Imagem" : isPdf ? "PDF" : doc.file_type}\n`;
      context += `- Tamanho: ${Math.round(doc.file_size / 1024)} KB\n`;
      context += `- Data: ${new Date(doc.created_at).toLocaleDateString("pt-BR")}\n`;
      
      if (fileUrl) {
        context += `- URL para download: ${fileUrl}\n`;
        context += `- Para enviar este arquivo ao usuário, use: [ORBI_FILE]{"name": "${doc.file_name}", "url": "${fileUrl}", "type": "${doc.file_type}"}[/ORBI_FILE]\n`;
      }
      
      if (doc.content_summary) {
        context += `- Resumo: ${doc.content_summary}\n`;
      }
      if (doc.extracted_text) {
        // Limit extracted text to prevent context overflow
        const truncatedText = doc.extracted_text.substring(0, 2000);
        context += `- Conteúdo extraído:\n${truncatedText}${doc.extracted_text.length > 2000 ? '...[truncado]' : ''}\n`;
      }
      context += `\n`;
    }

    return context;
  } catch (error) {
    console.error("Error building knowledge base context:", error);
    return "";
  }
}

// Build global context with ALL monitored companies for comparisons
async function buildGlobalCompaniesContext(supabase: any): Promise<string> {
  try {
    // Fetch all companies, prospects, and clients in parallel
    const [
      { data: competitors },
      { data: prospects },
      { data: clients },
    ] = await Promise.all([
      supabase.from("companies").select("id, name, domain, linkedin_followers, instagram_followers, youtube_subscribers, industry, sector, employee_count, headquarters").limit(100),
      supabase.from("prospects").select("id, name, domain, linkedin_followers, instagram_followers, youtube_subscribers, industry, sector, employee_count, headquarters").limit(100),
      supabase.from("clients").select("id, name, domain, linkedin_followers, instagram_followers, youtube_subscribers, industry, sector, employee_count, headquarters").limit(100),
    ]);

    // Fetch Glassdoor data for all
    const [
      { data: competitorGlassdoor },
      { data: prospectGlassdoor },
      { data: clientGlassdoor },
    ] = await Promise.all([
      supabase.from("glassdoor_summary").select("company_id, overall_rating, recommend_to_friend"),
      supabase.from("prospect_glassdoor_summary").select("prospect_id, overall_rating, recommend_to_friend"),
      supabase.from("client_glassdoor_summary").select("client_id, overall_rating, recommend_to_friend"),
    ]);

    // Create lookup maps for Glassdoor data
    const competitorGlassdoorMap = new Map(competitorGlassdoor?.map((g: any) => [g.company_id, g]) || []);
    const prospectGlassdoorMap = new Map(prospectGlassdoor?.map((g: any) => [g.prospect_id, g]) || []);
    const clientGlassdoorMap = new Map(clientGlassdoor?.map((g: any) => [g.client_id, g]) || []);

    let context = `\n=== TODAS AS EMPRESAS MONITORADAS ===\n`;

    // Competitors
    if (competitors?.length) {
      context += `\n## CONCORRENTES (${competitors.length} empresas)\n`;
      competitors.forEach((c: any) => {
        const glassdoor = competitorGlassdoorMap.get(c.id) as any;
        context += `- **${c.name || c.domain}** (${c.domain})\n`;
        context += `  Indústria: ${c.industry || "N/A"} | Funcionários: ${c.employee_count || "N/A"} | Local: ${c.headquarters || "N/A"}\n`;
        context += `  LinkedIn: ${c.linkedin_followers?.toLocaleString() || "N/A"} | Instagram: ${c.instagram_followers?.toLocaleString() || "N/A"} | YouTube: ${c.youtube_subscribers?.toLocaleString() || "N/A"}\n`;
        if (glassdoor) {
          context += `  Glassdoor: ${glassdoor.overall_rating || "N/A"}/5 | Recomendação: ${glassdoor.recommend_to_friend ? Math.round(glassdoor.recommend_to_friend * 100) + "%" : "N/A"}\n`;
        }
      });
    }

    // Prospects
    if (prospects?.length) {
      context += `\n## PROSPECTS (${prospects.length} empresas)\n`;
      prospects.forEach((p: any) => {
        const glassdoor = prospectGlassdoorMap.get(p.id) as any;
        context += `- **${p.name || p.domain}** (${p.domain})\n`;
        context += `  Indústria: ${p.industry || "N/A"} | Funcionários: ${p.employee_count || "N/A"} | Local: ${p.headquarters || "N/A"}\n`;
        context += `  LinkedIn: ${p.linkedin_followers?.toLocaleString() || "N/A"} | Instagram: ${p.instagram_followers?.toLocaleString() || "N/A"} | YouTube: ${p.youtube_subscribers?.toLocaleString() || "N/A"}\n`;
        if (glassdoor) {
          context += `  Glassdoor: ${glassdoor.overall_rating || "N/A"}/5 | Recomendação: ${glassdoor.recommend_to_friend ? Math.round(glassdoor.recommend_to_friend * 100) + "%" : "N/A"}\n`;
        }
      });
    }

    // Clients
    if (clients?.length) {
      context += `\n## CLIENTES (${clients.length} empresas)\n`;
      clients.forEach((cl: any) => {
        const glassdoor = clientGlassdoorMap.get(cl.id) as any;
        context += `- **${cl.name || cl.domain}** (${cl.domain})\n`;
        context += `  Indústria: ${cl.industry || "N/A"} | Funcionários: ${cl.employee_count || "N/A"} | Local: ${cl.headquarters || "N/A"}\n`;
        context += `  LinkedIn: ${cl.linkedin_followers?.toLocaleString() || "N/A"} | Instagram: ${cl.instagram_followers?.toLocaleString() || "N/A"} | YouTube: ${cl.youtube_subscribers?.toLocaleString() || "N/A"}\n`;
        if (glassdoor) {
          context += `  Glassdoor: ${glassdoor.overall_rating || "N/A"}/5 | Recomendação: ${glassdoor.recommend_to_friend ? Math.round(glassdoor.recommend_to_friend * 100) + "%" : "N/A"}\n`;
        }
      });
    }

    return context;
  } catch (error) {
    console.error("Error building global companies context:", error);
    return "";
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, entityId, entityType, conversationHistory = [], files = [] }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const GOOGLE_CLOUD_PROJECT_ID = Deno.env.get("GOOGLE_CLOUD_PROJECT_ID");
    const GOOGLE_CLOUD_LOCATION = Deno.env.get("GOOGLE_CLOUD_LOCATION") || "us-central1";
    const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

    // Validate auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with user's auth context for RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Use service role for data fetching (bypasses RLS for context building)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      const { data: dbKey } = await supabase.from("system_api_keys").select("api_key").eq("provider", "gemini").maybeSingle();
      if (dbKey?.api_key) {
        GOOGLE_AI_API_KEY = dbKey.api_key;
      }
    } catch (e) {
      console.error("Falha ao buscar chave no banco, utilizando Deno.env se existir:", e);
    }

    if (!GOOGLE_AI_API_KEY && (!GOOGLE_CLOUD_PROJECT_ID || !GOOGLE_SERVICE_ACCOUNT_JSON)) {
      console.error("No AI credentials configured (tried GOOGLE_AI_API_KEY and Vertex AI)");
      return new Response(
        JSON.stringify({ error: "Serviço de IA não configurado. Adicione via configurações ou Deno.env." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Validate the JWT using getUser
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error("JWT validation failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId: string | null = userData.user.id || null;

    // 4. Build contexts in parallel (Regular contexts + Semantic search)
    // We'll calculate the embedding and do the search as part of the context gathering
    const [entityContext, primaryCompanyContext, globalContext, knowledgeBaseContext, ragContext] = await Promise.all([
      entityId && entityType ? buildEntityContext(supabase, entityId, entityType) : Promise.resolve(""),
      userId ? buildPrimaryCompanyContext(supabase, userId) : Promise.resolve(""),
      buildGlobalCompaniesContext(supabase),
      userId ? buildKnowledgeBaseContext(supabase, userId) : Promise.resolve(""),
      (async () => {
        if (!message || message.length <= 3 || !userId) return "";
        try {
          const queryEmbedding = await generateEmbedding(message, GOOGLE_AI_API_KEY || undefined);
          const { data: matches, error: matchError } = await supabase.rpc("match_knowledge_chunks", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            p_user_id: userId
          });

          if (matchError) {
            console.error("Erro na busca semântica:", matchError);
            return "";
          }
          
          if (matches && matches.length > 0) {
            console.log(`RAG: Encontrados ${matches.length} trechos relevantes.`);
            return matches.map((m: any) => m.content).join("\n---\n");
          }
        } catch (ragError) {
          console.error("Erro no processo RAG:", ragError);
        }
        return "";
      })()
    ]);

    // 5. Assemble the final system prompt
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const systemPrompt = `Você é o **Orbi**, assistente de inteligência competitiva da plataforma MKT Prime.
Você ajuda a analisar dados de empresas, concorrentes, prospects e clientes.

**Data e hora atual:** ${currentDate}

Suas capacidades:
- Responder perguntas sobre dados de QUALQUER empresa monitorada no sistema
- Analisar métricas de redes sociais, Glassdoor e notícias de mercado
- **COMPARAR empresas** e identificar insights estratégicos
- **Analisar imagens e documentos** enviados pelo usuário
- **PESQUISAR NA WEB** (Google Search) para informações em tempo real
- **EXECUTAR AÇÕES** como iniciar novas análises ou gerenciar fotos de perfil

--- CONTEXTO DO SISTEMA ---
${entityContext ? `\nENTIDADE ATUAL:\n${entityContext}` : ""}
${primaryCompanyContext ? `\nSUA EMPRESA:\n${primaryCompanyContext}` : ""}
${globalContext ? `\nCONTEXTO GLOBAL:\n${globalContext}` : ""}
${knowledgeBaseContext ? `\nRESUMO DA BASE DE CONHECIMENTO:\n${knowledgeBaseContext}` : ""}

${ragContext ? `\n--- INFORMAÇÕES RELEVANTES ENCONTRADAS NA SUA BASE DE CONHECIMENTO ---\n${ragContext}\n` : ""}

Diretrizes:
1. Use as informações de contexto acima para responder de forma precisa.
2. Se a informação vier da "BASE DE CONHECIMENTO", priorize-a e mencione.
3. Se não encontrar dados, ofereça para pesquisar na web via Google Search.
4. Mantenha um tom profissional e analítico.
5. Sempre responda em Português do Brasil.

Para ações especiais (Tool Calling), use as tags [ORBI_ACTION] ou [ORBI_FILE] conforme definido nas suas instruções internas.`;

    // 6. Map conversation history and current content to Gemini format
    const contents = conversationHistory.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: Array.isArray(msg.content) 
        ? msg.content.map(part => (
            part.type === "text" 
            ? { text: part.text } 
            : { inline_data: { mime_type: part.image_url?.url.split(';')[0].split(':')[1] || "image/jpeg", data: part.image_url?.url.split(',')[1] || "" } }
          ))
        : [{ text: msg.content }]
    }));

    contents.push({
      role: "user",
      parts: files && files.length > 0 
        ? [
            { text: message },
            ...files.map(file => ({
              inline_data: {
                mime_type: file.type,
                data: file.base64.split(',')[1] || ""
              }
            }))
          ]
        : [{ text: message }]
    });

    // 7. Determine endpoint and auth
    let apiEndpoint: string;
    let authHeaderValue: string | null = null;

    if (GOOGLE_AI_API_KEY) {
      apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GOOGLE_AI_API_KEY}`;
    } else {
      apiEndpoint = `https://${GOOGLE_CLOUD_LOCATION}-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/${GOOGLE_CLOUD_LOCATION}/publishers/google/models/gemini-1.5-flash:streamGenerateContent`;
      
      try {
        const sa = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON!);
        const accessToken = await getGoogleAccessToken(sa, "https://www.googleapis.com/auth/cloud-platform");
        authHeaderValue = `Bearer ${accessToken}`;
      } catch (authError) {
        console.error("Error generating Google access token:", authError);
        return new Response(
          JSON.stringify({ error: "Erro na autenticação com o Google Cloud (Vertex AI)" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (authHeaderValue) headers["Authorization"] = authHeaderValue;

    const apiResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents,
        system_instruction: { parts: [{ text: systemPrompt }] },
        generation_config: {
          temperature: 0.2,
          top_p: 0.8,
          top_k: 40,
          max_output_tokens: 4096,
        },
        tools: [{ google_search: {} }],
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`Gemini API error: ${apiResponse.status}`, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua mensagem via Gemini AI." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 8. Stream response
    let buffer = "";
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        buffer += new TextDecoder().decode(chunk);
        let startIdx = 0;
        while ((startIdx = buffer.indexOf('{"candidates":', startIdx)) !== -1) {
          let braceCount = 0;
          let endIdx = -1;
          for (let i = startIdx; i < buffer.length; i++) {
            if (buffer[i] === '{') braceCount++;
            else if (buffer[i] === '}') {
              braceCount--;
              if (braceCount === 0) {
                endIdx = i;
                break;
              }
            }
          }

          if (endIdx !== -1) {
            const jsonStr = buffer.substring(startIdx, endIdx + 1);
            try {
              const data = JSON.parse(jsonStr);
              const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
              if (content) {
                const sseData = JSON.stringify({ choices: [{ delta: { content } }] });
                controller.enqueue(new TextEncoder().encode(`data: ${sseData}\n\n`));
              }
            } catch (e) {
              console.error("Error parsing JSON chunk:", e);
            }
            buffer = buffer.substring(endIdx + 1);
            startIdx = 0;
          } else {
            break;
          }
        }
      },
      flush(controller) {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      }
    });

    const body = apiResponse.body?.pipeThrough(transformStream);
    return new Response(body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateEmbedding(text: string, apiKey: string | undefined) {
  // Use a fallback or throw if no key
  if (!apiKey) throw new Error("Google AI API Key não configurada para embeddings");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-0608:embedContent?key=${apiKey}`;
  
  const payload = {
    model: "models/gemini-embedding-exp-0608",
    content: { parts: [{ text }] }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro na API de Embedding: ${error}`);
  }

  const result = await response.json();
  return result.embedding.values;
}
