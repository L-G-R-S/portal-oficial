import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  Filter, 
  X, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Building2,
  Users,
  Briefcase,
  Home,
  Zap,
  Timer,
  RefreshCw,
  Trash2,
  User,
  Bot
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useActivityLogs, type ActivityLog } from '@/hooks/useActivityLogs';
import { generateLogReport } from '@/utils/logReportGenerator';
import { useUserAction } from '@/hooks/useUserAction';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

const getEntityTypeInfo = (type: string) => {
  const info: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    competitor: { label: 'Concorrente', icon: <Building2 className="h-3 w-3" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    prospect: { label: 'Prospect', icon: <Users className="h-3 w-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    client: { label: 'Cliente', icon: <Briefcase className="h-3 w-3" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    primary: { label: 'Empresa Principal', icon: <Home className="h-3 w-3" />, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
  };
  return info[type] || { label: type, icon: null, color: 'bg-muted text-muted-foreground' };
};

const getTriggerTypeInfo = (type: string) => {
  const info: Record<string, { label: string; icon: React.ReactNode }> = {
    manual: { label: 'Manual (Batch)', icon: <RefreshCw className="h-3 w-3" /> },
    automatic: { label: 'Automático', icon: <Zap className="h-3 w-3" /> },
    manual_single: { label: 'Manual', icon: <RefreshCw className="h-3 w-3" /> }
  };
  return info[type] || { label: type, icon: null };
};

const getUpdateTypeInfo = (type: string) => {
  const info: Record<string, { label: string; color: string }> = {
    full: { label: 'Completa', color: 'bg-primary/20 text-primary border-primary/30' },
    content_news: { label: 'Conteúdo', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    news_only: { label: 'Notícias', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' }
  };
  return info[type] || { label: type, color: 'bg-muted text-muted-foreground' };
};

const getStatusInfo = (status: string) => {
  const info: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    pending: { label: 'Pendente', icon: <Clock className="h-3 w-3" />, color: 'text-muted-foreground' },
    running: { label: 'Executando', icon: <Loader2 className="h-3 w-3 animate-spin" />, color: 'text-blue-400' },
    success: { label: 'Sucesso', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-400' },
    failed: { label: 'Falhou', icon: <XCircle className="h-3 w-3" />, color: 'text-red-400' },
    timeout: { label: 'Timeout', icon: <AlertCircle className="h-3 w-3" />, color: 'text-amber-400' }
  };
  return info[status] || { label: status, icon: null, color: 'text-muted-foreground' };
};

const formatDuration = (log: ActivityLog): string => {
  // Use duration_seconds if valid
  if (log.duration_seconds && log.duration_seconds > 0) {
    const seconds = log.duration_seconds;
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  
  // Calculate from started_at and completed_at
  if (log.started_at && log.completed_at) {
    const start = new Date(log.started_at).getTime();
    const end = new Date(log.completed_at).getTime();
    const seconds = Math.max(1, Math.round((end - start) / 1000));
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  
  return '-';
};

const getEntityLink = (log: ActivityLog): string => {
  if (log.entity_id === 'batch') return ROUTES.AUTO_UPDATES;
  const routes: Record<string, string> = {
    competitor: ROUTES.COMPETITOR_DETAIL,
    prospect: ROUTES.PROSPECT_DETAIL,
    client: ROUTES.CLIENT_DETAIL,
    primary: ROUTES.PRIMARY_COMPANY_DETAIL
  };
  return `${routes[log.entity_type] || '/'}/${log.entity_id}`;
};

const Logs = () => {
  const navigate = useNavigate();
  const { 
    logs, 
    loading, 
    filters, 
    updateFilters, 
    clearFilters, 
    clearAllLogs,
    page, 
    setPage, 
    totalPages, 
    stats,
    refresh
  } = useActivityLogs();

  const { trackAction } = useUserAction();

  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      generateLogReport(logs, stats, { 
        start: filters.startDate, 
        end: filters.endDate 
      });
      trackAction('download_pdf', 'Exportou PDF de Logs de Análise');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllLogs = async () => {
    setIsClearing(true);
    try {
      const success = await clearAllLogs();
      if (success) {
        toast.success('Todos os logs foram limpos com sucesso');
      } else {
        toast.error('Erro ao limpar logs');
      }
    } finally {
      setIsClearing(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== 'all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Logs de Análises</h1>
            <p className="text-sm text-muted-foreground">Histórico completo de todas as análises</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loading} size="sm" className="sm:size-default">
            <RefreshCw className={cn("h-4 w-4 sm:mr-2", loading && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button onClick={handleExportPDF} disabled={isExporting || logs.length === 0} size="sm" className="sm:size-default">
            {isExporting ? (
              <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Exportar PDF</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isClearing || stats?.total === 0} size="sm" className="sm:size-default">
                {isClearing ? (
                  <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Limpar Tudo</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá remover permanentemente todos os {stats?.total || 0} registros de análises. 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllLogs} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Limpar Tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total de Análises</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.success}</p>
                  <p className="text-xs text-muted-foreground">Sucesso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.failed}</p>
                  <p className="text-xs text-muted-foreground">Falhas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Timer className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgDuration ? `${Math.round(stats.avgDuration)}s` : '-'}</p>
                  <p className="text-xs text-muted-foreground">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Select
              value={filters.entityType || 'all'}
              onValueChange={(v) => updateFilters({ entityType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Entidades</SelectItem>
                <SelectItem value="competitor">Concorrentes</SelectItem>
                <SelectItem value="prospect">Prospects</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
                <SelectItem value="primary">Empresa Principal</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.updateType || 'all'}
              onValueChange={(v) => updateFilters({ updateType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Atualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Atualizações</SelectItem>
                <SelectItem value="full">Análise Completa</SelectItem>
                <SelectItem value="content_news">Conteúdo + Notícias</SelectItem>
                <SelectItem value="news_only">Apenas Notícias</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.triggerType || 'all'}
              onValueChange={(v) => updateFilters({ triggerType: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Triggers</SelectItem>
                <SelectItem value="manual">Manual (Batch)</SelectItem>
                <SelectItem value="automatic">Automático</SelectItem>
                <SelectItem value="manual_single">Manual (Individual)</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => updateFilters({ status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="running">Executando</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="timeout">Timeout</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  {filters.startDate ? (
                    format(filters.startDate, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span className="text-muted-foreground">Data Início</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilters({ startDate: date })}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Data/Hora</TableHead>
                <TableHead className="text-xs sm:text-sm">Entidade</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">Trigger</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Atualização</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Duração</TableHead>
                <TableHead className="text-xs sm:text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum log encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const entityInfo = getEntityTypeInfo(log.entity_type);
                  const triggerInfo = getTriggerTypeInfo(log.trigger_type);
                  const updateInfo = getUpdateTypeInfo(log.update_type);
                  const statusInfo = getStatusInfo(log.status);

                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {log.created_at ? (
                          <div>
                            <div>{format(new Date(log.created_at), "dd/MM/yyyy", { locale: ptBR })}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(log.created_at), "HH:mm:ss", { locale: ptBR })}
                            </div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {log.entity_id === 'batch' ? (
                          <Link 
                            to={ROUTES.AUTO_UPDATES}
                            className="hover:underline text-primary flex items-center gap-2"
                          >
                            <span className="font-medium text-amber-500">[Lote]</span>
                            {log.entity_name || 'Atualização em Massa'}
                          </Link>
                        ) : (
                          <Link 
                            to={getEntityLink(log)}
                            className="hover:underline text-primary"
                          >
                            {log.entity_name || log.entity_domain || 'Sem nome'}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={cn("text-xs gap-1", entityInfo.color)}>
                          {entityInfo.icon}
                          <span className="hidden md:inline">{entityInfo.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            {triggerInfo.icon}
                            <span className="hidden lg:inline">{triggerInfo.label}</span>
                          </div>
                          <Badge variant="outline" className="w-fit text-[10px] leading-tight px-1.5 py-0 flex items-center gap-1 bg-muted/50 font-normal">
                            {log.trigger_type === 'automatic' || !log.user_name ? (
                              <>
                                <Bot className="h-2.5 w-2.5 text-amber-500" />
                                <span>Automático</span>
                              </>
                            ) : (
                              <>
                                <User className="h-2.5 w-2.5 text-blue-500" />
                                <span className="truncate max-w-[120px]" title={log.user_name}>{log.user_name.split(' ')[0]}</span>
                              </>
                            )}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={cn("text-xs", updateInfo.color)}>
                          {updateInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {formatDuration(log)}
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1 text-sm", statusInfo.color)}>
                          {statusInfo.icon}
                          <span className="hidden sm:inline">{statusInfo.label}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Logs;
