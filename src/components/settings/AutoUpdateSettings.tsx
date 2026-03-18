import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Clock, Calendar, CheckCircle2, XCircle, Trash2, AlertTriangle, Timer, Newspaper, Database, FileText, Users, Building2, Briefcase } from 'lucide-react';
import { useUpdateSettings } from '@/hooks/useUpdateSettings';
import { formatDistanceToNow, format, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDurationFromDates } from '@/lib/formatters';
import { ROUTES } from '@/lib/constants';

const FREQUENCY_OPTIONS = [
  { value: '5', label: '5 minutos' },
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '60', label: '1 hora' },
  { value: '360', label: '6 horas' },
  { value: '720', label: '12 horas' },
  { value: '1440', label: '1 dia' },
  { value: '4320', label: '3 dias' },
  { value: '10080', label: '7 dias' },
  { value: '21600', label: '15 dias' },
  { value: '43200', label: '30 dias' },
];


// Helper to get update type label and icon
function getUpdateTypeInfo(updateType: string | null | undefined) {
  switch (updateType) {
    case 'news_only':
      return { label: 'Notícias', icon: Newspaper, color: 'text-blue-500' };
    case 'content_news':
      return { label: 'Conteúdos', icon: FileText, color: 'text-purple-500' };
    case 'full':
    default:
      return { label: 'Completa', icon: Database, color: 'text-green-500' };
  }
}

// Helper to get entity type badge
function getEntityTypeBadge(type: string) {
  switch (type) {
    case 'competitor':
      return { label: 'C', fullLabel: 'Concorrentes', icon: Building2 };
    case 'prospect':
      return { label: 'P', fullLabel: 'Prospects', icon: Users };
    case 'client':
      return { label: 'Cl', fullLabel: 'Clientes', icon: Briefcase };
    default:
      return { label: type, fullLabel: type, icon: Building2 };
  }
}

export function AutoUpdateSettings() {
  const navigate = useNavigate();
  const {
    settings,
    logs,
    isLoading,
    isUpdating,
    currentLog,
    updateSettings,
    triggerManualUpdate,
    cancelUpdate,
    clearLogs
  } = useUpdateSettings();

  // ALL HOOKS MUST BE BEFORE ANY EARLY RETURNS
  const [countdown, setCountdown] = React.useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = React.useState<string | null>(null);
  
  // Calculate next update time based on current settings
  const calculatedNextUpdate = useMemo(() => {
    if (!settings?.is_enabled) return null;
    
    const baseTime = settings.last_update_at 
      ? new Date(settings.last_update_at) 
      : new Date();
    const nextUpdate = new Date(baseTime.getTime() + settings.frequency_minutes * 60 * 1000);
    
    return nextUpdate;
  }, [settings?.is_enabled, settings?.last_update_at, settings?.frequency_minutes]);
  
  // Update countdown every second
  React.useEffect(() => {
    if (!settings?.is_enabled || !calculatedNextUpdate) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = calculatedNextUpdate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Aguardando execução...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setCountdown(`${days}d ${remainingHours}h ${minutes}min`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}min ${seconds}s`);
      } else if (minutes > 0) {
        setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setCountdown(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings?.is_enabled, calculatedNextUpdate]);
  
  // Update elapsed time every second
  React.useEffect(() => {
    if (!isUpdating || !currentLog?.started_at) {
      setElapsedTime(null);
      return;
    }

    const updateElapsed = () => {
      const startedAt = new Date(currentLog.started_at);
      const now = new Date();
      const seconds = differenceInSeconds(now, startedAt);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setElapsedTime(`${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [isUpdating, currentLog?.started_at]);

  // EARLY RETURNS AFTER ALL HOOKS
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!settings) return null;

  const progress = currentLog?.total_entities 
    ? Math.round((currentLog.entities_updated / currentLog.total_entities) * 100)
    : 0;

  const getStatusInfo = (status: string, currentEntityDomain?: string | null, currentEntityName?: string | null) => {
    const entityLabel = currentEntityName || currentEntityDomain;
    
    switch (status) {
      case 'running':
        return { 
          label: entityLabel ? `Processando: ${entityLabel}` : 'Processando...', 
          description: 'Aguardando resposta do servidor de análise. Isso pode levar alguns minutos por entidade.',
          icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />
        };
      case 'pending':
        return { 
          label: 'Iniciando...', 
          description: 'Preparando a atualização em lote.',
          icon: <Clock className="h-4 w-4 text-muted-foreground" />
        };
      default:
        return { 
          label: 'Processando...', 
          description: 'Processando atualização.',
          icon: <Loader2 className="h-4 w-4 animate-spin text-primary" />
        };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Atualização Automática
        </CardTitle>
        <CardDescription>
          Configure a atualização automática de concorrentes, prospects e clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-update">Ativar atualização automática</Label>
            <p className="text-sm text-muted-foreground">
              Atualiza automaticamente todas as entidades no intervalo configurado
            </p>
          </div>
          <Switch
            id="auto-update"
            checked={settings.is_enabled}
            onCheckedChange={(checked) => updateSettings({ is_enabled: checked })}
          />
        </div>

        {/* Frequency Selection */}
        <div className="space-y-2">
          <Label>Frequência de atualização</Label>
          <Select
            value={settings.frequency_minutes.toString()}
            onValueChange={(value) => updateSettings({ frequency_minutes: parseInt(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Update Type Selection */}
        <div className="space-y-3">
          <Label>Tipo de atualização</Label>
          <RadioGroup
            value={settings.update_type || 'full'}
            onValueChange={(value) => updateSettings({ update_type: value as 'full' | 'content_news' | 'news_only' })}
            className="space-y-2"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="full" id="update-full" className="mt-0.5" />
              <div className="space-y-1">
                <label htmlFor="update-full" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Análise completa
                </label>
                <p className="text-xs text-muted-foreground">
                  Atualiza todos os dados: redes sociais, Glassdoor, liderança, notícias, etc.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="content_news" id="update-content" className="mt-0.5" />
              <div className="space-y-1">
                <label htmlFor="update-content" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Análise de conteúdos e notícias
                </label>
                <p className="text-xs text-muted-foreground">
                  Atualiza Glassdoor, Instagram, YouTube, LinkedIn, blogs e notícias
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="news_only" id="update-news" className="mt-0.5" />
              <div className="space-y-1">
                <label htmlFor="update-news" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  Apenas notícias
                </label>
                <p className="text-xs text-muted-foreground">
                  Atualiza somente as notícias e novidades de mercado (mais rápido)
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Entity Types to Update */}
        <div className="space-y-3">
          <Label>Entidades para atualizar</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="update-competitors"
                checked={settings.update_competitors}
                onCheckedChange={(checked) => 
                  updateSettings({ update_competitors: checked as boolean })
                }
              />
              <label htmlFor="update-competitors" className="text-sm cursor-pointer">
                Concorrentes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="update-prospects"
                checked={settings.update_prospects}
                onCheckedChange={(checked) => 
                  updateSettings({ update_prospects: checked as boolean })
                }
              />
              <label htmlFor="update-prospects" className="text-sm cursor-pointer">
                Prospects
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="update-clients"
                checked={settings.update_clients}
                onCheckedChange={(checked) => 
                  updateSettings({ update_clients: checked as boolean })
                }
              />
              <label htmlFor="update-clients" className="text-sm cursor-pointer">
                Clientes
              </label>
            </div>
          </div>
        </div>

        {/* Update Status */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Última atualização:</span>
            </div>
            <span className="font-medium">
              {settings.last_update_at 
                ? formatDistanceToNow(new Date(settings.last_update_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })
                : 'Nunca'
              }
            </span>
          </div>

          {settings.is_enabled && calculatedNextUpdate && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima atualização:</span>
                </div>
                <span className="font-medium">
                  {format(calculatedNextUpdate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </span>
              </div>
              {countdown && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="h-4 w-4" />
                    <span>Tempo restante:</span>
                  </div>
                  <span className="font-mono font-medium text-primary">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {isUpdating && currentLog && (
          <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusInfo(currentLog.status, currentLog.current_entity_domain, currentLog.current_entity_name).icon}
                <span className="font-medium text-sm">
                  {getStatusInfo(currentLog.status, currentLog.current_entity_domain, currentLog.current_entity_name).label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {elapsedTime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Timer className="h-3 w-3" />
                    <span className="font-mono">{elapsedTime}</span>
                  </div>
                )}
                {currentLog.total_entities > 0 && (
                  <span className="text-muted-foreground font-medium">
                    {currentLog.entities_updated}/{currentLog.total_entities}
                  </span>
                )}
              </div>
            </div>
            
            {currentLog.total_entities > 0 && (
              <Progress value={progress} className="h-2" />
            )}
            
            <p className="text-xs text-muted-foreground">
              {getStatusInfo(currentLog.status, currentLog.current_entity_domain, currentLog.current_entity_name).description}
            </p>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={cancelUpdate}
              className="w-full"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar Atualização
            </Button>
          </div>
        )}

        {/* Manual Update Button */}
        <Button
          onClick={triggerManualUpdate}
          disabled={isUpdating || (!settings.update_competitors && !settings.update_prospects && !settings.update_clients)}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Agora
            </>
          )}
        </Button>

        {/* Recent Logs - Enhanced */}
        {logs.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label>Histórico recente</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(ROUTES.LOGS)}
                  className="h-8"
                >
                  Ver todos os logs
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearLogs}
                  className="h-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Limpar
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.slice(0, 5).map((log) => {
                const getLogIcon = () => {
                  const updated = log.entities_updated || 0;
                  const total = log.total_entities || 0;
                  
                  // Check for partial success first
                  if (log.status === 'completed' || log.status === 'failed') {
                    if (updated === total && updated > 0) {
                      return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
                    } else if (updated > 0 && updated < total) {
                      return <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />;
                    } else if (updated === 0 && log.status === 'failed') {
                      return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
                    }
                  }
                  
                  switch (log.status) {
                    case 'completed':
                      return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
                    case 'running':
                    case 'dispatched':
                    case 'pending':
                      return <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />;
                    case 'cancelled':
                      return <XCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />;
                    case 'timeout':
                      return <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />;
                    case 'failed':
                      return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
                    default:
                      return <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
                  }
                };
                
                // Check if this is a partial success
                const isPartialSuccess = (log.entities_updated || 0) > 0 && 
                  (log.entities_updated || 0) < (log.total_entities || 0);
                const shouldShowError = log.error_message && (log.entities_updated || 0) === 0;

                const updateTypeInfo = getUpdateTypeInfo(log.update_type);
                const UpdateTypeIcon = updateTypeInfo.icon;
                const entityTypes = log.entity_types || [];
                const duration = formatDurationFromDates(log.started_at, log.completed_at);

                return (
                  <div 
                    key={log.id}
                    className="p-3 bg-muted/30 rounded-lg space-y-2"
                  >
                    {/* Top row: Status, Date, Duration, Count */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {getLogIcon()}
                        <span className="font-medium">
                          {format(new Date(log.started_at), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {log.completed_at && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Timer className="h-3 w-3" />
                            <span className="text-xs font-mono">{duration}</span>
                          </div>
                        )}
                        <span className="text-muted-foreground font-medium">
                          {log.entities_updated || 0}/{log.total_entities || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Bottom row: Update type and Entity types */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs ${updateTypeInfo.color}`}>
                          <UpdateTypeIcon className="h-3 w-3 mr-1" />
                          {updateTypeInfo.label}
                        </Badge>
                        {entityTypes.length > 0 && (
                          <div className="flex gap-1">
                            {entityTypes.map((type: string) => {
                              const badge = getEntityTypeBadge(type);
                              return (
                                <Badge 
                                  key={type} 
                                  variant="secondary" 
                                  className="text-xs px-1.5"
                                  title={badge.fullLabel}
                                >
                                  {badge.label}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {isPartialSuccess && (
                        <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">
                          Parcial
                        </Badge>
                      )}
                      {shouldShowError && (
                        <span className="text-xs text-destructive truncate max-w-[150px]" title={log.error_message}>
                          {log.error_message}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}