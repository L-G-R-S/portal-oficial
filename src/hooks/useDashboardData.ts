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
  entity_type: 'competitor' | 'prospect' | 'client' | 'primary';
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

      // Fetch all companies (primary, competitors, prospects, clients)
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('linkedin_followers', { ascending: false, nullsFirst: false });

      const allCompaniesList: EntityData[] = (companiesData || []).map(c => ({
        id: c.id,
        name: c.name,
        domain: c.domain,
        logo_url: c.logo_url,
        industry: c.industry,
        linkedin_followers: c.linkedin_followers,
        instagram_followers: c.instagram_followers,
        youtube_subscribers: c.youtube_subscribers,
        type: c.entity_type as any
      }));

      // Get glassdoor ratings for all
      if (allCompaniesList.length > 0) {
        const { data: glassdoorData } = await supabase
          .from('glassdoor_summary')
          .select('company_id, overall_rating')
          .in('company_id', allCompaniesList.map(c => c.id));

        if (glassdoorData) {
          allCompaniesList.forEach(c => {
            const gd = glassdoorData.find(g => g.company_id === c.id);
            c.glassdoor_rating = gd?.overall_rating ?? null;
          });
        }
      }

      setPrimaryCompany(allCompaniesList.find(c => c.type === 'primary') || null);
      setCompetitors(allCompaniesList.filter(c => c.type === 'competitor'));
      setProspects(allCompaniesList.filter(c => c.type === 'prospect'));
      setClients(allCompaniesList.filter(c => c.type === 'client'));

      // Fetch recent news from single table
      const { data: newsData } = await supabase
        .from('market_news')
        .select('id, title, url, date, summary, classification, company_id')
        .order('date', { ascending: false, nullsFirst: false })
        .limit(60);

      const allNews: NewsItem[] = (newsData || []).map(n => {
        const entity = allCompaniesList.find(c => c.id === n.company_id);
        return {
          id: n.id,
          title: n.title,
          url: n.url,
          date: n.date,
          summary: n.summary,
          classification: n.classification,
          entity_name: entity?.name ?? null,
          entity_logo: entity?.logo_url ?? null,
          entity_type: entity?.type as any
        };
      }).filter(n => n.entity_type && n.entity_type !== 'primary');

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
