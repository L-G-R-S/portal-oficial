import { Card } from '@/components/ui/card';
import { Building2, Target, Users, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { ENTITY_COLORS } from '@/lib/colors';

interface MarketSummaryProps {
  stats: {
    totalCompetitors: number;
    totalProspects: number;
    totalClients: number;
    totalNews: number;
  };
}

export function MarketSummary({ stats }: MarketSummaryProps) {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Concorrentes',
      value: stats.totalCompetitors,
      subtitle: 'empresas monitoradas',
      icon: Building2,
      color: `text-[${ENTITY_COLORS.competitor}]`,
      bgColor: `bg-[${ENTITY_COLORS.competitor}]/10`,
      onClick: () => navigate(ROUTES.COMPETITORS)
    },
    {
      title: 'Prospects',
      value: stats.totalProspects,
      subtitle: 'em prospecção',
      icon: Target,
      color: `text-[${ENTITY_COLORS.prospect}]`,
      bgColor: `bg-[${ENTITY_COLORS.prospect}]/10`,
      onClick: () => navigate(ROUTES.PROSPECTS)
    },
    {
      title: 'Clientes',
      value: stats.totalClients,
      subtitle: 'na base',
      icon: Users,
      color: `text-[${ENTITY_COLORS.client}]`,
      bgColor: `bg-[${ENTITY_COLORS.client}]/10`,
      onClick: () => navigate(ROUTES.CLIENTS)
    },
    {
      title: 'Notícias',
      value: stats.totalNews,
      subtitle: 'recentes',
      icon: Newspaper,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      onClick: undefined
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title}
          className={`p-5 bg-card border shadow-sm min-h-[100px] transition-all ${card.onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : ''}`}
          onClick={card.onClick}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bgColor} shrink-0`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}