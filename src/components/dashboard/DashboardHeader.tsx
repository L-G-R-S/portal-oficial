import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { Clock } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
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
  );
}
