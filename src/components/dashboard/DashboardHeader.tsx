import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, ExternalLink } from 'lucide-react';

interface DashboardHeaderProps {
  lastAnalysis: string | null;
}

export function DashboardHeader({ lastAnalysis }: DashboardHeaderProps) {
  const { user, profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {displayName}!
          </h1>
          <p className="text-muted-foreground text-sm">
            Visão geral da sua inteligência competitiva
          </p>
        </div>
        {lastAnalysis && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Última análise: {formatDistanceToNow(new Date(lastAnalysis), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
        )}
      </div>

      {/* Portfolio banner */}
      <a
        href="https://ofertas.primecontrol.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">Conheça</span>
          <span className="text-sm font-medium text-foreground">nosso portfólio de ofertas da Prime Control</span>
        </div>
        <ExternalLink className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}
