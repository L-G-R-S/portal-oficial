import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { formatDuration } from '@/lib/formatters';
import { ENTITY_COLORS } from '@/lib/colors';

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

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" style={{ color: ENTITY_COLORS.client }} />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Clock className="h-4 w-4" style={{ color: ENTITY_COLORS.prospect }} />;
  }
};

const getUpdateTypeBadge = (updateType: string) => {
  switch (updateType) {
    case 'full':
      return <Badge variant="outline" className="text-xs">Completa</Badge>;
    case 'content_news':
      return <Badge variant="outline" className="text-xs">Conteúdo</Badge>;
    case 'news_only':
      return <Badge variant="outline" className="text-xs">Notícias</Badge>;
    default:
      return null;
  }
};

const getTriggerLabel = (trigger: string) => {
  switch (trigger) {
    case 'manual': return 'Manual';
    case 'manual_single': return 'Manual';
    case 'automatic': return 'Automática';
    default: return trigger;
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const navigate = useNavigate();

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhuma atividade recente
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <CardTitle className="text-lg font-semibold flex items-center justify-center sm:justify-start gap-2 w-full text-center sm:text-left">
          <Activity className="h-5 w-5 text-primary" />
          Atividade Recente
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/logs')}
          className="text-xs w-full sm:w-auto mt-2 sm:mt-0"
          aria-label="Ver todos os logs de atividade"
        >
          Ver todos
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 pt-0 sm:pt-6">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
          >
            {getStatusIcon(activity.status)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium truncate">
                  {activity.entity_name || 'Empresa'}
                </span>
                {getUpdateTypeBadge(activity.update_type)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{getTriggerLabel(activity.trigger_type)}</span>
                {activity.duration_seconds && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(activity.duration_seconds)}</span>
                  </>
                )}
                {activity.started_at && (
                  <>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(activity.started_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}