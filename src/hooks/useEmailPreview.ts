import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  url: string | null;
  date: string;
  entity_type: 'competitor' | 'prospect' | 'client';
  entity_id: string;
  news_table: 'market_news' | 'prospect_market_news' | 'client_market_news';
  selected: boolean;
  excluded: boolean;
  edited_title?: string;
  edited_summary?: string;
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

function isHighImpactNews(title: string, summary: string | null): boolean {
  const content = `${title || ''} ${summary || ''}`.toLowerCase();
  
  if (LOW_IMPACT_KEYWORDS.some(kw => content.includes(kw))) {
    return false;
  }
  
  return HIGH_IMPACT_KEYWORDS.some(kw => content.includes(kw));
}

// Orbi - Notícias brand colors
const PRIME_COLOR = '#131A2A';
const PRIME_COLOR_DARK = '#0d111d';
const LOGO_URL = 'https://eqsoalwednwswslxamfz.supabase.co/storage/v1/object/public/post-media/orbi-logo.png';

export function useEmailPreview() {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isExcluding, setIsExcluding] = useState(false);
  const [onlyHighImpact, setOnlyHighImpact] = useState(true);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from('email_alert_settings')
        .select('only_high_impact')
        .limit(1)
        .maybeSingle();
      
      if (data) {
        setOnlyHighImpact(data.only_high_impact ?? true);
      }
    };
    loadSettings();
  }, []);

  const fetchRecentNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Fetch excluded news
      const { data: excludedData } = await supabase
        .from('excluded_news')
        .select('news_id, news_table');
      
      const excludedSet = new Set(
        (excludedData || []).map(e => `${e.news_table}:${e.news_id}`)
      );

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

      let allNews: NewsItem[] = [];

      if (competitorNews.data) {
        allNews.push(...competitorNews.data.map(n => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          url: n.url,
          date: n.date,
          entity_type: 'competitor' as const,
          entity_id: n.company_id,
          news_table: 'market_news' as const,
          selected: !excludedSet.has(`market_news:${n.id}`),
          excluded: excludedSet.has(`market_news:${n.id}`),
        })));
      }

      if (prospectNews.data) {
        allNews.push(...prospectNews.data.map(n => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          url: n.url,
          date: n.date,
          entity_type: 'prospect' as const,
          entity_id: n.prospect_id,
          news_table: 'prospect_market_news' as const,
          selected: !excludedSet.has(`prospect_market_news:${n.id}`),
          excluded: excludedSet.has(`prospect_market_news:${n.id}`),
        })));
      }

      if (clientNews.data) {
        allNews.push(...clientNews.data.map(n => ({
          id: n.id,
          title: n.title,
          summary: n.summary,
          url: n.url,
          date: n.date,
          entity_type: 'client' as const,
          entity_id: n.client_id,
          news_table: 'client_market_news' as const,
          selected: !excludedSet.has(`client_market_news:${n.id}`),
          excluded: excludedSet.has(`client_market_news:${n.id}`),
        })));
      }

      // Filter by high impact if enabled (but keep excluded for display)
      if (onlyHighImpact) {
        allNews = allNews.filter(n => n.excluded || isHighImpactNews(n.title, n.summary));
      }

      // Sort by date
      allNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Take top 20
      allNews = allNews.slice(0, 20);

      setNews(allNews);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Erro ao carregar notícias',
        description: 'Não foi possível carregar as notícias recentes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [onlyHighImpact, toast]);

  // Initial load
  useEffect(() => {
    fetchRecentNews();
  }, [fetchRecentNews]);

  const toggleSelection = useCallback((id: string) => {
    setNews(prev => prev.map(n => 
      n.id === id ? { ...n, selected: !n.selected } : n
    ));
  }, []);

  const selectAll = useCallback(() => {
    setNews(prev => prev.map(n => ({ ...n, selected: !n.excluded })));
  }, []);

  const deselectAll = useCallback(() => {
    setNews(prev => prev.map(n => ({ ...n, selected: false })));
  }, []);

  const updateNewsItem = useCallback((id: string, updates: { title?: string; summary?: string }) => {
    setNews(prev => prev.map(n => 
      n.id === id 
        ? { 
            ...n, 
            edited_title: updates.title ?? n.edited_title,
            edited_summary: updates.summary ?? n.edited_summary,
          } 
        : n
    ));
  }, []);

  const excludeNews = useCallback(async (newsId: string, newsTable: string) => {
    setIsExcluding(true);
    try {
      const { error } = await supabase
        .from('excluded_news')
        .insert({ 
          news_id: newsId, 
          news_table: newsTable 
        });

      if (error) throw error;

      setNews(prev => prev.map(n => 
        n.id === newsId ? { ...n, excluded: true, selected: false } : n
      ));

      toast({
        title: 'Notícia excluída',
        description: 'Esta notícia não será enviada nos próximos emails.',
      });
    } catch (error: any) {
      console.error('Error excluding news:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir a notícia.',
        variant: 'destructive',
      });
    } finally {
      setIsExcluding(false);
    }
  }, [toast]);

  const restoreNews = useCallback(async (newsId: string, newsTable: string) => {
    setIsExcluding(true);
    try {
      const { error } = await supabase
        .from('excluded_news')
        .delete()
        .eq('news_id', newsId)
        .eq('news_table', newsTable);

      if (error) throw error;

      setNews(prev => prev.map(n => 
        n.id === newsId ? { ...n, excluded: false, selected: true } : n
      ));

      toast({
        title: 'Notícia restaurada',
        description: 'Esta notícia voltará a aparecer nos próximos emails.',
      });
    } catch (error: any) {
      console.error('Error restoring news:', error);
      toast({
        title: 'Erro ao restaurar',
        description: error.message || 'Não foi possível restaurar a notícia.',
        variant: 'destructive',
      });
    } finally {
      setIsExcluding(false);
    }
  }, [toast]);

  const getSelectedNews = useCallback(() => {
    return news
      .filter(n => n.selected && !n.excluded)
      .map(n => ({
        title: n.edited_title || n.title,
        summary: n.edited_summary || n.summary || '',
        url: n.url,
        date: n.date,
        entity_type: n.entity_type,
      }));
  }, [news]);

  const generateEmailHtml = useCallback(() => {
    const selectedNews = getSelectedNews();
    
    if (selectedNews.length === 0) {
      return '<p style="text-align: center; color: #6b7280;">Nenhuma notícia selecionada</p>';
    }

    const newsHtml = selectedNews.map(n => {
      const entityStyles: Record<string, { label: string; bgColor: string; textColor: string }> = {
        competitor: { label: 'Concorrente', bgColor: '#fef2f2', textColor: '#dc2626' },
        prospect: { label: 'Prospect', bgColor: '#eff6ff', textColor: '#2563eb' },
        client: { label: 'Cliente', bgColor: '#f0fdf4', textColor: '#16a34a' },
      };
      const style = entityStyles[n.entity_type] || { label: 'Notícia', bgColor: '#f3f4f6', textColor: '#374151' };
      const summary = n.summary ? (n.summary.length > 200 ? n.summary.substring(0, 200) + '...' : n.summary) : 'Sem resumo disponível.';

      return `
        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #e5e7eb;">
          <div style="display: inline-block; background-color: ${style.bgColor}; color: ${style.textColor}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 10px;">
            ${style.label}
          </div>
          <h3 style="color: #0f172a; margin: 8px 0; font-size: 16px; line-height: 1.5; font-weight: 600;">
            ${n.title}
          </h3>
          <p style="color: #64748b; margin: 0 0 14px 0; font-size: 14px; line-height: 1.6;">
            ${summary}
          </p>
          ${n.url ? `
            <a href="${n.url}" style="color: ${PRIME_COLOR}; text-decoration: none; font-size: 13px; font-weight: 500;">
              Ler mais →
            </a>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header with Orbi branding -->
        <div style="background: linear-gradient(135deg, ${PRIME_COLOR} 0%, ${PRIME_COLOR_DARK} 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="${LOGO_URL}" alt="Orbi - Notícias" style="height: 40px; margin-bottom: 16px;" onerror="this.style.display='none'">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Resumo Semanal</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
            ${selectedNews.length} notícia${selectedNews.length !== 1 ? 's' : ''} relevante${selectedNews.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none;">
          ${newsHtml}
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: ${PRIME_COLOR}; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
            Orbi - Notícias
          </p>
          <p style="color: #64748b; margin: 0; font-size: 12px;">
            Inteligência de Mercado • Monitoramento Competitivo
          </p>
        </div>
      </div>
    `;
  }, [getSelectedNews]);

  const sendSelectedNews = useCallback(async (subscriberIds?: string[]) => {
    const selectedNews = getSelectedNews();
    
    if (selectedNews.length === 0) {
      toast({
        title: 'Nenhuma notícia selecionada',
        description: 'Selecione pelo menos uma notícia para enviar.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-digest-email', {
        body: {
          subscriber_ids: subscriberIds,
          force: true,
          custom_news: selectedNews,
        },
      });

      if (error) throw error;

      toast({
        title: 'Email enviado!',
        description: `${data?.sent || 0} email(s) enviado(s) com ${selectedNews.length} notícias.`,
      });

      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar o email. Tente novamente.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [getSelectedNews, toast]);

  const selectedCount = news.filter(n => n.selected && !n.excluded).length;
  const excludedCount = news.filter(n => n.excluded).length;

  return {
    news,
    isLoading,
    isSending,
    isExcluding,
    selectedCount,
    excludedCount,
    totalCount: news.length,
    onlyHighImpact,
    setOnlyHighImpact,
    fetchRecentNews,
    toggleSelection,
    selectAll,
    deselectAll,
    updateNewsItem,
    excludeNews,
    restoreNews,
    generateEmailHtml,
    sendSelectedNews,
  };
}
