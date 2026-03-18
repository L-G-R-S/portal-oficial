import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CompanyHero } from '@/components/dashboard/CompanyHero';
import { MarketSummary } from '@/components/dashboard/MarketSummary';
import { SocialComparisonChart } from '@/components/dashboard/SocialComparisonChart';
import { GlassdoorComparison } from '@/components/dashboard/GlassdoorComparison';
import { EntityRankingTable } from '@/components/dashboard/EntityRankingTable';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { QuickInsights } from '@/components/dashboard/QuickInsights';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export default function Dashboard() {
  const {
    primaryCompany,
    competitors,
    prospects,
    clients,
    recentNews,
    recentActivity,
    stats,
    isLoading,
    lastAnalysis
  } = useDashboardData();

  // Calculate LinkedIn rank for primary company
  const calculateLinkedInRank = () => {
    if (!primaryCompany?.linkedin_followers) return undefined;
    
    const allWithLinkedIn = [
      primaryCompany,
      ...competitors
    ].filter(c => c.linkedin_followers)
      .sort((a, b) => (b.linkedin_followers || 0) - (a.linkedin_followers || 0));
    
    const rank = allWithLinkedIn.findIndex(c => c.id === primaryCompany.id) + 1;
    return rank > 0 ? rank : undefined;
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <DashboardHeader lastAnalysis={lastAnalysis} />

      {/* Company Hero */}
      <CompanyHero 
        company={primaryCompany}
        linkedinRank={calculateLinkedInRank()}
        totalCompetitors={competitors.length}
      />

      {/* Market Summary Cards */}
      <MarketSummary stats={stats} />

      {/* Quick Insights */}
      <QuickInsights 
        primaryCompany={primaryCompany}
        competitors={competitors}
        prospects={prospects}
        clients={clients}
        recentNews={recentNews}
      />

      {/* Social Comparison Charts */}
      <SocialComparisonChart 
        primaryCompany={primaryCompany}
        competitors={competitors}
        prospects={prospects}
        clients={clients}
      />

      {/* Glassdoor Comparison */}
      <GlassdoorComparison 
        primaryCompany={primaryCompany}
        competitors={competitors}
        prospects={prospects}
        clients={clients}
      />

      {/* Entity Ranking Table */}
      <EntityRankingTable 
        primaryCompany={primaryCompany}
        competitors={competitors}
        prospects={prospects}
        clients={clients}
      />

      {/* News and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <NewsFeed news={recentNews} />
        <ActivityFeed activities={recentActivity} />
      </div>
    </div>
  );
}
