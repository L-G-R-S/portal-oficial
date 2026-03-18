import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ChevronLeft, 
  RefreshCw, 
  Clock, 
  Calendar, 
  Building2,
  FileText,
  Newspaper,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Ban,
  Timer,
  Trash2
} from "lucide-react";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";

const FREQUENCY_OPTIONS = [
  { value: '1440', label: 'Diária', description: '1 vez por dia' },
  { value: '10080', label: 'Semanal', description: '1 vez por semana' },
  { value: '20160', label: 'Quinzenal', description: 'A cada 2 semanas' },
  { value: '43200', label: 'Mensal', description: '1 vez por mês' },
];

const getUpdateTypeInfo = (updateType: string | null | undefined) => {
  switch (updateType) {
    case 'full':
      return { label: 'Análise Completa', icon: FileText, color: 'text-blue-500' };
    case 'content_news':
      return { label: 'Conteúdo + Notícias', icon: Newspaper, color: 'text-purple-500' };
    case 'news_only':
      return { label: 'Somente Notícias', icon: Newspaper, color: 'text-green-500' };
    default:
      return { label: 'Análise Completa', icon: FileText, color: 'text-blue-500' };
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    completed: { label: 'Concluído', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
    running: { label: 'Em andamento', variant: 'secondary', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    pending: { label: 'Pendente', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
    dispatched: { label: 'Processando', variant: 'secondary', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
    failed: { label: 'Falhou', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
    cancelled: { label: 'Cancelado', variant: 'outline', icon: <Ban className="h-3 w-3" /> },
    timeout: { label: 'Expirado', variant: 'destructive', icon: <Timer className="h-3 w-3" /> },
  };

  const config = statusConfig[status] || statusConfig.pending;
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default function AutoUpdates() {
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
    clearLogs,
    refreshSettings 
  } = useUpdateSettings();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [countdown, setCountdown] = useState<string | null>(null);

  // Elapsed time during update
  useEffect(() => {
    if (!isUpdating || !currentLog) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(currentLog.started_at).getTime();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isUpdating, currentLog]);

  // Countdown to next update
  useEffect(() => {
    if (!settings?.next_update_at || !settings.is_enabled) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const nextUpdate = new Date(settings.next_update_at!).getTime();
      const now = Date.now();
      const diff = nextUpdate - now;

      if (diff <= 0) {
        setCountdown('Agora');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setCountdown(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [settings?.next_update_at, settings?.is_enabled]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const updateTypeInfo = getUpdateTypeInfo(settings?.update_type);
  const UpdateTypeIcon = updateTypeInfo.icon;

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completedLogs = logs.filter(log => 
    ['completed', 'failed', 'cancelled', 'timeout'].includes(log.status)
  );

  const entityTypesLabel = [
    settings?.update_competitors && 'Concorrentes',
    settings?.update_prospects && 'Prospects',
    settings?.update_clients && 'Clientes',
  ].filter(Boolean).join(', ') || 'Nenhum';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Atualização Automática
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure atualizações automáticas de concorrentes, prospects e clientes
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={refreshSettings} disabled={isUpdating}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">
                  {settings?.is_enabled ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-muted-foreground">Desativado</span>
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-full ${settings?.is_enabled ? 'bg-green-100' : 'bg-muted'}`}>
                <RefreshCw className={`h-5 w-5 ${settings?.is_enabled ? 'text-green-600' : 'text-muted-foreground'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                <p className="text-lg font-bold">
                  {settings?.last_update_at 
                    ? formatDistanceToNow(new Date(settings.last_update_at), { addSuffix: true, locale: ptBR })
                    : 'Nunca'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próxima Atualização</p>
                <p className="text-lg font-bold">
                  {settings?.is_enabled && countdown ? countdown : 'Não agendado'}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entidades</p>
                <p className="text-sm font-bold">{entityTypesLabel}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Banner */}
      {isUpdating && currentLog && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">Atualização em andamento</p>
                    <p className="text-sm text-muted-foreground">
                      {currentLog.current_entity_name 
                        ? `Processando: ${currentLog.current_entity_name}`
                        : 'Iniciando...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono">{formatElapsedTime(elapsedTime)}</span>
                  <Button variant="outline" size="sm" onClick={cancelUpdate}>
                    <Ban className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
              {currentLog.total_entities > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentLog.entities_updated} de {currentLog.total_entities} entidades</span>
                    <span>{Math.round((currentLog.entities_updated / currentLog.total_entities) * 100)}%</span>
                  </div>
                  <Progress value={(currentLog.entities_updated / currentLog.total_entities) * 100} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações Gerais</CardTitle>
            <CardDescription>Ative e configure a frequência das atualizações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Atualização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  {settings?.is_enabled 
                    ? 'Atualizações automáticas estão ativas'
                    : 'Ative para atualizar automaticamente'}
                </p>
              </div>
              <Switch
                checked={settings?.is_enabled ?? false}
                onCheckedChange={(checked) => updateSettings({ is_enabled: checked })}
              />
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select
                value={settings?.frequency_minutes?.toString() ?? '10080'}
                onValueChange={(value) => updateSettings({ frequency_minutes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Update Type */}
            <div className="space-y-3">
              <Label>Tipo de Atualização</Label>
              <RadioGroup
                value={settings?.update_type ?? 'full'}
                onValueChange={(value) => updateSettings({ update_type: value as 'full' | 'content_news' | 'news_only' })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Análise Completa</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Atualiza todos os dados: perfil, redes sociais, notícias e análises
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="content_news" id="content_news" />
                  <Label htmlFor="content_news" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Conteúdo + Notícias</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Atualiza posts de redes sociais e notícias recentes
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="news_only" id="news_only" />
                  <Label htmlFor="news_only" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Newspaper className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Somente Notícias</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Atualiza apenas as notícias do mercado (mais rápido)
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Entity Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entidades Monitoradas</CardTitle>
            <CardDescription>Selecione quais tipos de entidades serão atualizadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                <Checkbox
                  id="competitors"
                  checked={settings?.update_competitors ?? true}
                  onCheckedChange={(checked) => updateSettings({ update_competitors: !!checked })}
                />
                <Label htmlFor="competitors" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium">Concorrentes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Empresas concorrentes cadastradas
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                <Checkbox
                  id="prospects"
                  checked={settings?.update_prospects ?? true}
                  onCheckedChange={(checked) => updateSettings({ update_prospects: !!checked })}
                />
                <Label htmlFor="prospects" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="font-medium">Prospects</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Potenciais clientes em prospecção
                  </p>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                <Checkbox
                  id="clients"
                  checked={settings?.update_clients ?? true}
                  onCheckedChange={(checked) => updateSettings({ update_clients: !!checked })}
                />
                <Label htmlFor="clients" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">Clientes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Clientes ativos da empresa
                  </p>
                </Label>
              </div>
            </div>

            {/* Manual Update Button */}
            <div className="pt-4 border-t">
              <Button 
                onClick={triggerManualUpdate} 
                disabled={isUpdating}
                className="w-full"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Agora
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Inicia uma atualização manual imediatamente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Histórico de Atualizações</CardTitle>
            <CardDescription>Últimas 10 atualizações realizadas</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/logs')}>
              <FileText className="h-4 w-4 mr-2" />
              Ver todos os logs
            </Button>
            {completedLogs.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Histórico
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atualização realizada ainda</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Entidades</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Resultado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const typeInfo = getUpdateTypeInfo(log.update_type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(log.started_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.started_at), 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                          <span className="text-sm">{typeInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {log.entity_types?.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type === 'competitor' && '🔴'}
                              {type === 'prospect' && '🔵'}
                              {type === 'client' && '🟢'}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right">
                        {log.status === 'completed' && (
                          <span className="text-green-600 font-medium">
                            {log.entities_updated}/{log.total_entities}
                          </span>
                        )}
                        {log.status === 'failed' && (
                          <span className="text-destructive text-sm">
                            {log.error_message || 'Erro desconhecido'}
                          </span>
                        )}
                        {log.status === 'timeout' && (
                          <span className="text-destructive text-sm">Timeout</span>
                        )}
                        {['running', 'pending', 'dispatched'].includes(log.status) && (
                          <span className="text-muted-foreground">
                            {log.entities_updated}/{log.total_entities || '?'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
