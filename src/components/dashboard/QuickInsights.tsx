import { Card } from '@/components/ui/card';
import { TrendingUp, Trophy, AlertCircle, Linkedin, Users, Star, Newspaper } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { ENTITY_COLORS } from '@/lib/colors';

interface EntityData {
  id: string;
  name: string | null;
  linkedin_followers: number | null;
  instagram_followers: number | null;
  youtube_subscribers: number | null;
  glassdoor_rating?: number | null;
  type: 'primary' | 'competitor' | 'prospect' | 'client';
}

interface NewsItem {
  date: string | null;
}

interface QuickInsightsProps {
  primaryCompany: EntityData | null;
  competitors: EntityData[];
  prospects: EntityData[];
  clients: EntityData[];
  recentNews: NewsItem[];
}

export function QuickInsights({ 
  primaryCompany, 
  competitors, 
  prospects, 
  clients,
  recentNews 
}: QuickInsightsProps) {
  // All companies for comparison
  const allCompanies = [
    ...(primaryCompany ? [primaryCompany] : []),
    ...competitors
  ];
  
  // Find top LinkedIn company among competitors
  const topLinkedIn = [...competitors]
    .filter(c => c.linkedin_followers)
    .sort((a, b) => (b.linkedin_followers || 0) - (a.linkedin_followers || 0))[0];

  // Find best Glassdoor rating among all
  const topGlassdoor = [...allCompanies]
    .filter(c => c.glassdoor_rating && c.glassdoor_rating > 0)
    .sort((a, b) => (b.glassdoor_rating || 0) - (a.glassdoor_rating || 0))[0];

  // Calculate primary company LinkedIn rank
  const linkedInRank = primaryCompany?.linkedin_followers 
    ? allCompanies
        .filter(c => c.linkedin_followers)
        .sort((a, b) => (b.linkedin_followers || 0) - (a.linkedin_followers || 0))
        .findIndex(c => c.id === primaryCompany.id) + 1
    : null;

  // Find top client by LinkedIn
  const topClientLinkedIn = [...clients]
    .filter(c => c.linkedin_followers)
    .sort((a, b) => (b.linkedin_followers || 0) - (a.linkedin_followers || 0))[0];

  // Find top prospect by Glassdoor
  const topProspectGlassdoor = [...prospects]
    .filter(p => p.glassdoor_rating && p.glassdoor_rating > 0)
    .sort((a, b) => (b.glassdoor_rating || 0) - (a.glassdoor_rating || 0))[0];

  // Count recent news (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentNewsCount = recentNews.filter(n => {
    if (!n.date) return false;
    return new Date(n.date) >= sevenDaysAgo;
  }).length;

  // Use centralized colors for consistency
  const competitorColor = `text-[${ENTITY_COLORS.competitor}]`;
  const competitorBg = `bg-[${ENTITY_COLORS.competitor}]/10`;
  const clientColor = `text-[${ENTITY_COLORS.client}]`;
  const clientBg = `bg-[${ENTITY_COLORS.client}]/10`;
  const prospectColor = `text-[${ENTITY_COLORS.prospect}]`;
  const prospectBg = `bg-[${ENTITY_COLORS.prospect}]/10`;

  const insights = [
    topLinkedIn && {
      icon: Linkedin,
      title: 'Maior audiência (Concorrentes)',
      value: topLinkedIn.name || 'N/A',
      subtitle: `${formatNumber(topLinkedIn.linkedin_followers || 0)} seguidores`,
      color: competitorColor,
      bgColor: competitorBg
    },
    topGlassdoor && {
      icon: Trophy,
      title: 'Melhor avaliação Glassdoor',
      value: topGlassdoor.name || 'N/A',
      subtitle: `⭐ ${topGlassdoor.glassdoor_rating?.toFixed(1)} de 5.0`,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    linkedInRank && primaryCompany && {
      icon: TrendingUp,
      title: 'Sua posição no LinkedIn',
      value: `${linkedInRank}º lugar`,
      subtitle: `Entre ${allCompanies.length} empresas`,
      color: linkedInRank <= 3 ? clientColor : prospectColor,
      bgColor: linkedInRank <= 3 ? clientBg : prospectBg
    },
    topClientLinkedIn && {
      icon: Users,
      title: 'Cliente com maior audiência',
      value: topClientLinkedIn.name || 'N/A',
      subtitle: `${formatNumber(topClientLinkedIn.linkedin_followers || 0)} seguidores`,
      color: clientColor,
      bgColor: clientBg
    },
    topProspectGlassdoor && {
      icon: Star,
      title: 'Prospect melhor avaliado',
      value: topProspectGlassdoor.name || 'N/A',
      subtitle: `⭐ ${topProspectGlassdoor.glassdoor_rating?.toFixed(1)} de 5.0`,
      color: prospectColor,
      bgColor: prospectBg
    },
    recentNewsCount > 0 && {
      icon: Newspaper,
      title: 'Notícias recentes',
      value: recentNewsCount.toString(),
      subtitle: 'nos últimos 7 dias',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted'
    },
    prospects.length > 0 && !topProspectGlassdoor && {
      icon: AlertCircle,
      title: 'Prospects pendentes',
      value: prospects.length.toString(),
      subtitle: 'empresas em prospecção',
      color: prospectColor,
      bgColor: prospectBg
    }
  ].filter(Boolean).slice(0, 4); // Limit to 4 insights to match MarketSummary grid

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => insight && (
        <Card key={index} className="p-5 bg-card border shadow-sm min-h-[100px] flex items-center">
          <div className="flex items-center gap-4 w-full">
            <div className={`p-3 rounded-xl ${insight.bgColor} shrink-0`}>
              <insight.icon className={`h-6 w-6 ${insight.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">{insight.title}</p>
              <p className="text-xl font-bold text-foreground truncate">{insight.value}</p>
              <p className="text-xs text-muted-foreground">{insight.subtitle}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}