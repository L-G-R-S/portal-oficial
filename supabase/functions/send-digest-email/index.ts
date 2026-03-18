import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DigestPayload {
  subscriber_ids?: string[];
  force?: boolean;
  custom_news?: Array<{
    title: string;
    summary: string;
    url?: string | null;
    date: string;
    entity_type: string;
  }>;
}

// High impact keywords - news we want to send
const HIGH_IMPACT_KEYWORDS = [
  'aquisição', 'adquire', 'adquiriu', 'compra', 'comprou', 'fusão',
  'novo ceo', 'novo presidente', 'mudança de liderança', 'nova liderança',
  'ipo', 'investimento', 'rodada de financiamento', 'captação', 'série a', 'série b', 'série c',
  'expansão', 'nova sede', 'nova unidade', 'novo escritório',
  'parceria estratégica', 'joint venture', 'acordo',
  'fechamento', 'encerramento', 'demissões em massa', 'layoff',
  'lançamento', 'novo produto', 'nova solução', 'nova funcionalidade',
  'prêmio', 'reconhecimento', 'certificação',
];

// Low impact keywords - news we don't want to send
const LOW_IMPACT_KEYWORDS = [
  'vaga', 'vagas', 'emprego', 'contratando', 'oportunidade de trabalho', 'hiring',
  'post no linkedin', 'post no instagram', 'post no facebook',
  'webinar', 'evento online', 'live', 'transmissão',
  'newsletter', 'blog post',
];

function isHighImpactNews(title: string, summary: string): boolean {
  const content = `${title || ''} ${summary || ''}`.toLowerCase();
  
  // Check if contains low impact keywords - skip these
  if (LOW_IMPACT_KEYWORDS.some(kw => content.includes(kw))) {
    return false;
  }
  
  // Check if contains high impact keywords
  return HIGH_IMPACT_KEYWORDS.some(kw => content.includes(kw));
}

// Orbi - Notícias brand colors and template
const PRIME_COLOR = '#131A2A';
const PRIME_COLOR_DARK = '#0d111d';
const LOGO_URL = 'https://eqsoalwednwswslxamfz.supabase.co/storage/v1/object/public/post-media/orbi-logo.png';

function generateEmailTemplate(newsHtml: string, newsCount: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resumo Semanal - Orbi Notícias</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td>
        <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header with Prime Control branding -->
          <div style="background: linear-gradient(135deg, ${PRIME_COLOR} 0%, ${PRIME_COLOR_DARK} 100%); padding: 30px; text-align: center;">
            <img src="${LOGO_URL}" alt="Orbi - Notícias" style="height: 40px; margin-bottom: 16px;" onerror="this.style.display='none'">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Resumo Semanal</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
              ${newsCount} notícia${newsCount !== 1 ? 's' : ''} relevante${newsCount !== 1 ? 's' : ''} dos últimos 7 dias
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            ${newsHtml}
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: ${PRIME_COLOR}; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
              Orbi - Notícias
            </p>
            <p style="color: #64748b; margin: 0; font-size: 12px;">
              Inteligência de Mercado • Monitoramento Competitivo
            </p>
            <p style="color: #94a3b8; margin: 16px 0 0 0; font-size: 11px;">
              Você recebe este email por estar inscrito nos alertas da Orbi.
            </p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateNewsItemHtml(news: any): string {
  const entityStyles: Record<string, { label: string; bgColor: string; textColor: string }> = {
    competitor: { label: 'Concorrente', bgColor: '#fef2f2', textColor: '#dc2626' },
    prospect: { label: 'Prospect', bgColor: '#eff6ff', textColor: '#2563eb' },
    client: { label: 'Cliente', bgColor: '#f0fdf4', textColor: '#16a34a' },
  };
  
  const style = entityStyles[news.entity_type] || { label: 'Notícia', bgColor: '#f3f4f6', textColor: '#374151' };
  const summary = news.summary ? (news.summary.length > 200 ? news.summary.substring(0, 200) + '...' : news.summary) : 'Sem resumo disponível.';

  return `
    <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
      <div style="display: inline-block; background-color: ${style.bgColor}; color: ${style.textColor}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">
        ${style.label}
      </div>
      <h3 style="color: #0f172a; margin: 8px 0; font-size: 16px; line-height: 1.5; font-weight: 600;">
        ${news.title}
      </h3>
      <p style="color: #64748b; margin: 0 0 14px 0; font-size: 14px; line-height: 1.6;">
        ${summary}
      </p>
      ${news.url ? `
        <a href="${news.url}" style="color: ${PRIME_COLOR}; text-decoration: none; font-size: 13px; font-weight: 500;">
          Ler mais →
        </a>
      ` : ''}
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // TRAVA DE SEGURANÇA - DESATIVADO TEMPORARIAMENTE
  const EMAILS_ENABLED = false;
  if (!EMAILS_ENABLED) {
    console.log("Email sending is temporarily disabled by admin request.");
    return new Response(
      JSON.stringify({ success: true, message: "Envio de e-mails desativado temporariamente", sent: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: DigestPayload = await req.json();
    const { subscriber_ids, force, custom_news } = payload;

    console.log("Processing digest email request", { subscriber_ids, force, hasCustomNews: !!custom_news });

    // Get settings to check if only high impact news should be sent
    const { data: settings } = await supabase
      .from('email_alert_settings')
      .select('only_high_impact')
      .limit(1)
      .maybeSingle();

    const onlyHighImpact = settings?.only_high_impact ?? true;

    // Get subscribers
    let subscribersQuery = supabase
      .from('email_subscribers')
      .select('id, email, name, entities_filter')
      .eq('is_active', true);

    if (subscriber_ids && subscriber_ids.length > 0) {
      subscribersQuery = subscribersQuery.in('id', subscriber_ids);
    } else {
      subscribersQuery = subscribersQuery.eq('receive_weekly_digest', true);
    }

    const { data: subscribers, error: subError } = await subscribersQuery;

    if (subError) throw subError;
    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get excluded news IDs
    const { data: excludedNews } = await supabase
      .from('excluded_news')
      .select('news_id, news_table');
    
    const excludedSet = new Set(
      (excludedNews || []).map(e => `${e.news_table}:${e.news_id}`)
    );

    // Get recent news from the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch news from all entity types
    const [competitorNews, prospectNews, clientNews] = await Promise.all([
      supabase
        .from('market_news')
        .select('id, title, summary, url, date, company_id')
        .gte('date', weekAgo.toISOString())
        .order('date', { ascending: false })
        .limit(20),
      supabase
        .from('prospect_market_news')
        .select('id, title, summary, url, date, prospect_id')
        .gte('date', weekAgo.toISOString())
        .order('date', { ascending: false })
        .limit(20),
      supabase
        .from('client_market_news')
        .select('id, title, summary, url, date, client_id')
        .gte('date', weekAgo.toISOString())
        .order('date', { ascending: false })
        .limit(20),
    ]);

    // Combine and filter news
    let allNews: any[] = [];

    if (competitorNews.data) {
      allNews.push(...competitorNews.data
        .filter(n => !excludedSet.has(`market_news:${n.id}`))
        .map(n => ({ ...n, entity_type: 'competitor' }))
      );
    }
    if (prospectNews.data) {
      allNews.push(...prospectNews.data
        .filter(n => !excludedSet.has(`prospect_market_news:${n.id}`))
        .map(n => ({ ...n, entity_type: 'prospect' }))
      );
    }
    if (clientNews.data) {
      allNews.push(...clientNews.data
        .filter(n => !excludedSet.has(`client_market_news:${n.id}`))
        .map(n => ({ ...n, entity_type: 'client' }))
      );
    }

    // Use custom news if provided, otherwise use fetched news
    let topNews: any[];
    if (custom_news && custom_news.length > 0) {
      topNews = custom_news;
      console.log(`Using ${topNews.length} custom news items`);
    } else {
      // Filter by high impact if enabled
      if (onlyHighImpact) {
        allNews = allNews.filter(n => isHighImpactNews(n.title, n.summary));
      }

      if (allNews.length === 0) {
        console.log("No relevant news to send");
        return new Response(
          JSON.stringify({ success: true, message: "No relevant news found", sent: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Sort by date
      allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Take top 10 news
      topNews = allNews.slice(0, 10);
    }

    console.log(`Sending ${topNews.length} news items`);

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Send digest to each subscriber
    for (const subscriber of subscribers) {
      try {
        // Filter news by subscriber's entity preferences
        const filter = subscriber.entities_filter || { competitors: true, prospects: true, clients: true };
        const filteredNews = topNews.filter(n => {
          if (n.entity_type === 'competitor') return filter.competitors;
          if (n.entity_type === 'prospect') return filter.prospects;
          if (n.entity_type === 'client') return filter.clients;
          return true;
        });

        if (filteredNews.length === 0) {
          console.log(`No news matching preferences for ${subscriber.email}`);
          continue;
        }

        const newsHtml = filteredNews.map(n => generateNewsItemHtml(n)).join('');
        const htmlContent = generateEmailTemplate(newsHtml, filteredNews.length);

        const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { 
              name: "Orbi - Notícias", 
              email: "luguilherme07@gmail.com" 
            },
            to: [{ 
              email: subscriber.email, 
              name: subscriber.name || subscriber.email 
            }],
            subject: `📊 Resumo Semanal: ${filteredNews.length} notícia${filteredNews.length !== 1 ? 's' : ''} importante${filteredNews.length !== 1 ? 's' : ''}`,
            htmlContent,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.message || "Failed to send email");
        }

        // Log successful send
        await supabase.from("email_logs").insert({
          subscriber_id: subscriber.id,
          email_to: subscriber.email,
          subject: `Resumo Semanal: ${filteredNews.length} notícias`,
          template_type: "weekly_digest",
          status: "sent",
        });

        results.push({ email: subscriber.email, success: true });
        console.log(`Digest sent to ${subscriber.email}`);
      } catch (emailError: any) {
        console.error(`Failed to send digest to ${subscriber.email}:`, emailError);
        
        await supabase.from("email_logs").insert({
          subscriber_id: subscriber.id,
          email_to: subscriber.email,
          subject: "Resumo Semanal",
          template_type: "weekly_digest",
          status: "failed",
          error_message: emailError.message,
        });

        results.push({ email: subscriber.email, success: false, error: emailError.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Digest complete: ${successCount}/${results.length} sent`);

    // Update last_digest_at
    await supabase
      .from('email_alert_settings')
      .update({ last_digest_at: new Date().toISOString() })
      .not('id', 'is', null);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount, 
        total: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-digest-email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
