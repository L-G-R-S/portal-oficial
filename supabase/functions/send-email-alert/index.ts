import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";


interface EmailAlertPayload {
  news_title: string;
  news_summary: string;
  news_url?: string;
  entity_name: string;
  entity_type: 'competitor' | 'prospect' | 'client';
}

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  entities_filter: {
    competitors: boolean;
    prospects: boolean;
    clients: boolean;
  };
}

// Orbi - Notícias brand colors
const PRIME_COLOR = '#131A2A';
const PRIME_COLOR_DARK = '#0d111d';
const LOGO_URL = 'https://eqsoalwednwswslxamfz.supabase.co/storage/v1/object/public/post-media/orbi-logo.png';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // TRAVA DE SEGURANÇA - DESATIVADO TEMPORARIAMENTE
  const EMAILS_ENABLED = false;
  if (!EMAILS_ENABLED) {
    console.log("Email alerts are temporarily disabled by admin request.");
    return new Response(
      JSON.stringify({ success: true, message: "Alertas de e-mail desativados temporariamente", sent: 0 }),
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

    const payload: EmailAlertPayload = await req.json();
    const { news_title, news_summary, news_url, entity_name, entity_type } = payload;

    console.log(`Processing email alert for: ${entity_name} (${entity_type})`);

    // Fetch active subscribers with instant alerts enabled
    const { data: subscribers, error: fetchError } = await supabase
      .from("email_subscribers")
      .select("id, email, name, entities_filter")
      .eq("is_active", true)
      .eq("receive_instant_alerts", true);

    if (fetchError) {
      console.error("Error fetching subscribers:", fetchError);
      throw fetchError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("No active subscribers found");
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers to notify", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Filter subscribers by entity type preference
    const entityTypeMap: Record<string, keyof Subscriber['entities_filter']> = {
      competitor: 'competitors',
      prospect: 'prospects',
      client: 'clients',
    };

    const filterKey = entityTypeMap[entity_type];
    const eligibleSubscribers = subscribers.filter((sub: Subscriber) => {
      const filter = sub.entities_filter || { competitors: true, prospects: true, clients: true };
      return filter[filterKey] !== false;
    });

    console.log(`Sending to ${eligibleSubscribers.length} eligible subscribers`);

    const results: { email: string; success: boolean; error?: string }[] = [];

    // Entity type styles
    const entityStyles: Record<string, { label: string; bgColor: string; textColor: string }> = {
      competitor: { label: 'Concorrente', bgColor: '#fef2f2', textColor: '#dc2626' },
      prospect: { label: 'Prospect', bgColor: '#eff6ff', textColor: '#2563eb' },
      client: { label: 'Cliente', bgColor: '#f0fdf4', textColor: '#16a34a' },
    };

    // Send emails to each subscriber
    for (const subscriber of eligibleSubscribers) {
      try {
        const style = entityStyles[entity_type] || { label: 'Notícia', bgColor: '#f3f4f6', textColor: '#374151' };

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Notícia - Orbi Notícias</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td>
        <div style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <!-- Header with Prime Vision branding -->
          <div style="background: linear-gradient(135deg, ${PRIME_COLOR} 0%, ${PRIME_COLOR_DARK} 100%); padding: 30px; text-align: center;">
            <img src="${LOGO_URL}" alt="Orbi - Notícias" style="height: 40px; margin-bottom: 16px;" onerror="this.style.display='none'">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🔔 Alerta de Notícia</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <div style="display: inline-block; background-color: ${style.bgColor}; color: ${style.textColor}; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
              ${style.label}: ${entity_name}
            </div>
            
            <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; line-height: 1.4; font-weight: 600;">
              ${news_title}
            </h2>
            
            <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px; line-height: 1.6;">
              ${news_summary}
            </p>
            
            ${news_url ? `
            <a href="${news_url}" style="display: inline-block; background: linear-gradient(135deg, ${PRIME_COLOR} 0%, ${PRIME_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Ver mais detalhes →
            </a>
            ` : ''}
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
            subject: `🔔 ${style.label}: ${entity_name} - ${news_title.substring(0, 50)}${news_title.length > 50 ? '...' : ''}`,
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
          subject: news_title,
          template_type: "instant_alert",
          entity_type,
          entity_name,
          status: "sent",
        });

        results.push({ email: subscriber.email, success: true });
        console.log(`Email sent successfully to ${subscriber.email}`);
      } catch (emailError: any) {
        console.error(`Failed to send email to ${subscriber.email}:`, emailError);
        
        // Log failed send
        await supabase.from("email_logs").insert({
          subscriber_id: subscriber.id,
          email_to: subscriber.email,
          subject: news_title,
          template_type: "instant_alert",
          entity_type,
          entity_name,
          status: "failed",
          error_message: emailError.message,
        });

        results.push({ email: subscriber.email, success: false, error: emailError.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Email alert complete: ${successCount}/${results.length} sent successfully`);

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
    console.error("Error in send-email-alert:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
