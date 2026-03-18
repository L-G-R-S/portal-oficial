import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SocialMetrics {
  linkedin_followers: number | null;
  instagram_followers: number | null;
  youtube_subscribers: number | null;
}

interface EntityData extends SocialMetrics {
  id: string;
  name: string | null;
  domain: string;
  logo_url: string | null;
  industry: string | null;
  glassdoor_rating?: number | null;
  type: 'primary' | 'competitor' | 'prospect' | 'client';
}

interface NewsItem {
  id: string;
  title: string | null;
  url: string | null;
  date: string | null;
  summary: string | null;
  classification: string | null;
  entity_name: string | null;
  entity_logo: string | null;
  entity_type: 'competitor' | 'prospect' | 'client';
}

interface ActivityItem {
  id: string;
  entity_name: string | null;
  entity_type: string;
  status: string;
  trigger_type: string;
  update_type: string;
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
}

interface DashboardStats {
  totalCompetitors: number;
  totalProspects: number;
  totalClients: number;
  totalNews: number;
}

interface DashboardData {
  primaryCompany: EntityData | null;
  competitors: EntityData[];
  prospects: EntityData[];
  clients: EntityData[];
  allEntities: EntityData[];
  recentNews: NewsItem[];
  recentActivity: ActivityItem[];
  stats: DashboardStats;
  isLoading: boolean;
  lastAnalysis: string | null;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [primaryCompany, setPrimaryCompany] = useState<EntityData | null>(null);
  const [competitors, setCompetitors] = useState<EntityData[]>([]);
  const [prospects, setProspects] = useState<EntityData[]>([]);
  const [clients, setClients] = useState<EntityData[]>([]);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch primary company (shared across all users)
      const { data: primaryData } = await supabase
        .from('primary_company')
        .select('*')
        .maybeSingle();

      let primaryCompanyData: EntityData | null = null;

      if (primaryData) {
        // Fetch primary company Glassdoor rating
        const { data: primaryGlassdoor } = await supabase
          .from('primary_company_glassdoor')
          .select('overall_rating')
          .eq('primary_company_id', primaryData.id)
          .maybeSingle();

        primaryCompanyData = {
          id: primaryData.id,
          name: primaryData.name,
          domain: primaryData.domain,
          logo_url: primaryData.logo_url,
          industry: primaryData.industry,
          linkedin_followers: primaryData.linkedin_followers,
          instagram_followers: primaryData.instagram_followers,
          youtube_subscribers: primaryData.youtube_subscribers,
          glassdoor_rating: primaryGlassdoor?.overall_rating ?? null,
          type: 'primary'
        };
        setPrimaryCompany(primaryCompanyData);
      }

      // Fetch competitors with glassdoor
      const { data: competitorsData } = await supabase
        .from('companies')
        .select('id, name, domain, logo_url, industry, linkedin_followers, instagram_followers, youtube_subscribers')
        .order('linkedin_followers', { ascending: false, nullsFirst: false });

      const competitorsList: EntityData[] = (competitorsData || []).map(c => ({
        ...c,
        type: 'competitor' as const
      }));

      // Get glassdoor ratings for competitors
      if (competitorsList.length > 0) {
        const { data: glassdoorData } = await supabase
          .from('glassdoor_summary')
          .select('company_id, overall_rating')
          .in('company_id', competitorsList.map(c => c.id));

        if (glassdoorData) {
          competitorsList.forEach(c => {
            const gd = glassdoorData.find(g => g.company_id === c.id);
            c.glassdoor_rating = gd?.overall_rating ?? null;
          });
        }
      }

      setCompetitors(competitorsList);

      // Fetch prospects
      const { data: prospectsData } = await supabase
        .from('prospects')
        .select('id, name, domain, logo_url, industry, linkedin_followers, instagram_followers, youtube_subscribers')
        .order('linkedin_followers', { ascending: false, nullsFirst: false });

      const prospectsList: EntityData[] = (prospectsData || []).map(p => ({
        ...p,
        type: 'prospect' as const
      }));

      // Get glassdoor ratings for prospects
      if (prospectsList.length > 0) {
        const { data: prospectGlassdoor } = await supabase
          .from('prospect_glassdoor_summary')
          .select('prospect_id, overall_rating')
          .in('prospect_id', prospectsList.map(p => p.id));

        if (prospectGlassdoor) {
          prospectsList.forEach(p => {
            const gd = prospectGlassdoor.find(g => g.prospect_id === p.id);
            p.glassdoor_rating = gd?.overall_rating ?? null;
          });
        }
      }

      setProspects(prospectsList);

      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, domain, logo_url, industry, linkedin_followers, instagram_followers, youtube_subscribers')
        .order('linkedin_followers', { ascending: false, nullsFirst: false });

      const clientsList: EntityData[] = (clientsData || []).map(c => ({
        ...c,
        type: 'client' as const
      }));

      // Get glassdoor ratings for clients
      if (clientsList.length > 0) {
        const { data: clientGlassdoor } = await supabase
          .from('client_glassdoor_summary')
          .select('client_id, overall_rating')
          .in('client_id', clientsList.map(c => c.id));

        if (clientGlassdoor) {
          clientsList.forEach(c => {
            const gd = clientGlassdoor.find(g => g.client_id === c.id);
            c.glassdoor_rating = gd?.overall_rating ?? null;
          });
        }
      }

      setClients(clientsList);

      // Fetch recent news from all sources (increased limit)
      const [competitorNews, prospectNews, clientNews] = await Promise.all([
        supabase
          .from('market_news')
          .select('id, title, url, date, summary, classification, company_id')
          .order('date', { ascending: false, nullsFirst: false })
          .limit(20),
        supabase
          .from('prospect_market_news')
          .select('id, title, url, date, summary, classification, prospect_id')
          .order('date', { ascending: false, nullsFirst: false })
          .limit(20),
        supabase
          .from('client_market_news')
          .select('id, title, url, date, summary, classification, client_id')
          .order('date', { ascending: false, nullsFirst: false })
          .limit(20)
      ]);

      // Map news with entity info
      const allNews: NewsItem[] = [];

      (competitorNews.data || []).forEach(n => {
        const entity = competitorsList.find(c => c.id === n.company_id);
        allNews.push({
          ...n,
          entity_name: entity?.name ?? null,
          entity_logo: entity?.logo_url ?? null,
          entity_type: 'competitor'
        });
      });

      (prospectNews.data || []).forEach(n => {
        const entity = prospectsList.find(p => p.id === n.prospect_id);
        allNews.push({
          id: n.id,
          title: n.title,
          url: n.url,
          date: n.date,
          summary: n.summary,
          classification: n.classification,
          entity_name: entity?.name ?? null,
          entity_logo: entity?.logo_url ?? null,
          entity_type: 'prospect'
        });
      });

      (clientNews.data || []).forEach(n => {
        const entity = clientsList.find(c => c.id === n.client_id);
        allNews.push({
          id: n.id,
          title: n.title,
          url: n.url,
          date: n.date,
          summary: n.summary,
          classification: n.classification,
          entity_name: entity?.name ?? null,
          entity_logo: entity?.logo_url ?? null,
          entity_type: 'client'
        });
      });

      // Sort by date and take top 20 for filters
      allNews.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setRecentNews(allNews.slice(0, 20));

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('analysis_activity_log')
        .select('id, entity_name, entity_type, status, trigger_type, update_type, started_at, completed_at, duration_seconds')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(5);

      setRecentActivity(activityData || []);

      // Set last analysis date
      if (activityData && activityData.length > 0) {
        setLastAnalysis(activityData[0].completed_at || activityData[0].started_at);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prospects' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'primary_company' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadData]);

  // Build all entities list
  const allEntities: EntityData[] = [
    ...(primaryCompany ? [primaryCompany] : []),
    ...competitors,
    ...prospects,
    ...clients
  ];

  const stats: DashboardStats = {
    totalCompetitors: competitors.length,
    totalProspects: prospects.length,
    totalClients: clients.length,
    totalNews: recentNews.length
  };

  return {
    primaryCompany,
    competitors,
    prospects,
    clients,
    allEntities,
    recentNews,
    recentActivity,
    stats,
    isLoading,
    lastAnalysis
  };
}
