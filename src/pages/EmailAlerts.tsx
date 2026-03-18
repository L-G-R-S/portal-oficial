import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Plus, Users, Send, ToggleLeft, Trash2, Edit, CheckCircle, XCircle, Settings, History, Search, Loader2, ChevronLeft, RefreshCw, Eye, Pencil, Ban, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useEmailSubscribers, EmailSubscriber } from '@/hooks/useEmailSubscribers';
import { useEmailAlertSettings, ProfileSearchResult } from '@/hooks/useEmailAlertSettings';
import { useEmailPreview } from '@/hooks/useEmailPreview';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ROUTES } from '@/lib/constants';

const FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instantâneo', description: 'Enviar assim que notícia relevante for detectada' },
  { value: 'daily', label: 'Diário', description: 'Resumo enviado todo dia no horário configurado' },
  { value: 'weekly', label: 'Semanal', description: 'Resumo enviado toda semana no dia configurado' },
  { value: 'monthly', label: 'Mensal', description: 'Resumo enviado todo mês no dia configurado' },
];

const DAY_OPTIONS = [
  { value: '1', label: 'Segunda-feira' },
  { value: '2', label: 'Terça-feira' },
  { value: '3', label: 'Quarta-feira' },
  { value: '4', label: 'Quinta-feira' },
  { value: '5', label: 'Sexta-feira' },
  { value: '6', label: 'Sábado' },
  { value: '7', label: 'Domingo' },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, '0')}:00`,
}));

export default function EmailAlerts() {
  const navigate = useNavigate();
  const { subscribers, logs, loading, stats, addSubscriber, updateSubscriber, removeSubscriber, toggleActive, fetchSubscribers, fetchLogs } = useEmailSubscribers();
  const { settings, isLoading: settingsLoading, isSending, updateSettings, searchProfiles, triggerManualSend } = useEmailAlertSettings();
  const { 
    news, 
    isLoading: previewLoading, 
    isSending: previewSending, 
    isExcluding,
    selectedCount, 
    excludedCount,
    totalCount,
    fetchRecentNews, 
    toggleSelection, 
    selectAll, 
    deselectAll, 
    updateNewsItem,
    excludeNews,
    restoreNews,
    generateEmailHtml, 
    sendSelectedNews 
  } = useEmailPreview();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditNewsDialogOpen, setIsEditNewsDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<EmailSubscriber | null>(null);
  const [editingNews, setEditingNews] = useState<{ id: string; title: string; summary: string } | null>(null);
  const [searchResults, setSearchResults] = useState<ProfileSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    receive_instant_alerts: true,
    receive_weekly_digest: true,
    entities_filter: {
      competitors: true,
      prospects: true,
      clients: true,
    },
  });

  // Search profiles with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchProfiles(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProfiles]);

  const handleRefresh = () => {
    fetchSubscribers();
    fetchLogs();
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      receive_instant_alerts: true,
      receive_weekly_digest: true,
      entities_filter: {
        competitors: true,
        prospects: true,
        clients: true,
      },
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectProfile = (profile: ProfileSearchResult) => {
    setFormData({
      ...formData,
      email: profile.email || '',
      name: profile.full_name,
    });
    setShowSearchPopover(false);
    setSearchQuery('');
  };

  const handleAddSubscriber = async () => {
    if (!formData.email) return;
    const success = await addSubscriber(formData);
    if (success) {
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditSubscriber = async () => {
    if (!selectedSubscriber) return;
    await updateSubscriber(selectedSubscriber.id, {
      name: formData.name || null,
      receive_instant_alerts: formData.receive_instant_alerts,
      receive_weekly_digest: formData.receive_weekly_digest,
      entities_filter: formData.entities_filter,
    });
    setIsEditDialogOpen(false);
    setSelectedSubscriber(null);
  };

  const handleDeleteSubscriber = async () => {
    if (!selectedSubscriber) return;
    await removeSubscriber(selectedSubscriber.id);
    setIsDeleteDialogOpen(false);
    setSelectedSubscriber(null);
  };

  const openEditDialog = (subscriber: EmailSubscriber) => {
    setSelectedSubscriber(subscriber);
    setFormData({
      email: subscriber.email,
      name: subscriber.name || '',
      receive_instant_alerts: subscriber.receive_instant_alerts,
      receive_weekly_digest: subscriber.receive_weekly_digest,
      entities_filter: subscriber.entities_filter,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (subscriber: EmailSubscriber) => {
    setSelectedSubscriber(subscriber);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Ban className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-amber-800">Alertas Temporariamente Desativados</h3>
          <p className="text-sm text-amber-700">
            O envio de alertas por e-mail foi desativado a pedido do administrador. A estrutura de assinantes e configurações foi mantida.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(ROUTES.SETTINGS)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Alertas por Email
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie assinantes, configurações de envio e histórico
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => triggerManualSend()} disabled={true}>
            <Ban className="h-4 w-4 mr-2" />
            Envio Desativado
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Assinantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.totalSubscribers}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assinantes Ativos</CardTitle>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-600">{stats.activeSubscribers}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados (Mês)</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.emailsSentThisMonth}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subscribers" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscribers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Assinantes</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </TabsTrigger>
        </TabsList>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Assinante
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Assinantes</CardTitle>
              <CardDescription>
                Pessoas que receberão alertas por email quando novas notícias forem detectadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum assinante cadastrado</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar primeiro assinante
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Alertas</TableHead>
                      <TableHead>Entidades</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || '-'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={subscriber.is_active}
                            onCheckedChange={(checked) => toggleActive(subscriber.id, checked)}
                            disabled={true}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {subscriber.receive_instant_alerts && (
                              <Badge variant="secondary" className="text-xs">Instantâneo</Badge>
                            )}
                            {subscriber.receive_weekly_digest && (
                              <Badge variant="outline" className="text-xs">Semanal</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {subscriber.entities_filter?.competitors && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Concorrentes</Badge>
                            )}
                            {subscriber.entities_filter?.prospects && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Prospects</Badge>
                            )}
                            {subscriber.entities_filter?.clients && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Clientes</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(subscriber)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(subscriber)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Resumo para Envio</CardTitle>
                  <CardDescription>
                    {previewLoading ? 'Carregando...' : `${totalCount} notícias dos últimos 7 dias${excludedCount > 0 ? ` (${excludedCount} excluída${excludedCount > 1 ? 's' : ''})` : ''}`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={fetchRecentNews} disabled={previewLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${previewLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notícia relevante encontrada</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {news.map((item) => {
                      const entityInfo = {
                        competitor: { label: '🔴 Concorrente', color: 'bg-red-50 text-red-700 border-red-200' },
                        prospect: { label: '🔵 Prospect', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                        client: { label: '🟢 Cliente', color: 'bg-green-50 text-green-700 border-green-200' },
                      }[item.entity_type] || { label: 'Notícia', color: '' };
                      
                      return (
                        <div key={item.id} className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
                          item.excluded 
                            ? 'bg-muted/50 border-dashed opacity-60' 
                            : item.selected 
                              ? 'bg-primary/5 border-primary/20' 
                              : 'bg-muted/30'
                        }`}>
                          <Checkbox 
                            checked={item.selected} 
                            onCheckedChange={() => toggleSelection(item.id)} 
                            className="mt-1" 
                            disabled={item.excluded}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className={entityInfo.color}>{entityInfo.label}</Badge>
                              {item.excluded && (
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                  <Ban className="h-3 w-3 mr-1" />
                                  Excluída
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <h4 className={`font-medium text-sm line-clamp-2 ${item.excluded ? 'line-through' : ''}`}>
                              {item.edited_title || item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.edited_summary || item.summary || 'Sem resumo'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!item.excluded && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => { 
                                  setEditingNews({ 
                                    id: item.id, 
                                    title: item.edited_title || item.title, 
                                    summary: item.edited_summary || item.summary || '' 
                                  }); 
                                  setIsEditNewsDialogOpen(true); 
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {item.excluded ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => restoreNews(item.id, item.news_table)}
                                disabled={isExcluding}
                                title="Restaurar notícia"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => excludeNews(item.id, item.news_table)}
                                disabled={isExcluding}
                                title="Excluir do envio"
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Prévia do Email</Label>
                    <div className="border rounded-lg p-4 bg-white max-h-[400px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: generateEmailHtml() }} />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">{selectedCount} de {totalCount} selecionadas</p>
                    <Button onClick={() => sendSelectedNews()} disabled={true}>
                      <Ban className="h-4 w-4 mr-2" />
                      Envio Desativado
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>Últimos 100 emails enviados</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum email enviado ainda</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm text-muted-foreground">{format(new Date(log.sent_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                        <TableCell className="font-medium">{log.email_to}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                        <TableCell><Badge variant="outline">{log.template_type === 'instant_alert' ? 'Alerta' : 'Resumo'}</Badge></TableCell>
                        <TableCell>
                          {log.status === 'sent' ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="h-3 w-3 mr-1" />Enviado</Badge>
                          ) : (
                            <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Envio</CardTitle>
              <CardDescription>
                Configure a frequência e tipo de alertas enviados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Envio Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Ativar envio automático de alertas por email
                      </p>
                    </div>
                    <Switch
                      checked={settings?.is_enabled ?? true}
                      onCheckedChange={(checked) => updateSettings({ is_enabled: checked })}
                      disabled={true}
                    />
                  </div>

                  {/* Frequency Type */}
                  <div className="space-y-3">
                    <Label>Frequência de Envio</Label>
                    <RadioGroup
                      value={settings?.frequency_type || 'weekly'}
                      onValueChange={(value: any) => updateSettings({ frequency_type: value })}
                      className="space-y-2"
                    >
                      {FREQUENCY_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor={option.value} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {/* Day/Hour Selection (for non-instant) */}
                  {settings?.frequency_type !== 'instant' && (
                    <div className="grid grid-cols-2 gap-4">
                      {settings?.frequency_type === 'weekly' && (
                        <div className="space-y-2">
                          <Label>Dia da Semana</Label>
                          <Select
                            value={String(settings?.frequency_day || 1)}
                            onValueChange={(value) => updateSettings({ frequency_day: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAY_OPTIONS.map((day) => (
                                <SelectItem key={day.value} value={day.value}>
                                  {day.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {settings?.frequency_type === 'monthly' && (
                        <div className="space-y-2">
                          <Label>Dia do Mês</Label>
                          <Select
                            value={String(settings?.frequency_day || 1)}
                            onValueChange={(value) => updateSettings({ frequency_day: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 28 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1)}>
                                  Dia {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Horário</Label>
                        <Select
                          value={String(settings?.frequency_hour || 9)}
                          onValueChange={(value) => updateSettings({ frequency_hour: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {HOUR_OPTIONS.map((hour) => (
                              <SelectItem key={hour.value} value={hour.value}>
                                {hour.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* High Impact Filter */}
                  <div className="flex items-start space-x-3 p-4 rounded-lg border bg-muted/30">
                    <Checkbox
                      id="high-impact"
                      checked={settings?.only_high_impact ?? true}
                      onCheckedChange={(checked) => updateSettings({ only_high_impact: !!checked })}
                    />
                    <div className="flex-1">
                      <Label htmlFor="high-impact" className="font-medium cursor-pointer">
                        Apenas notícias de alto impacto
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enviar apenas notícias relevantes como aquisições, mudanças de CEO, fusões, expansões e movimentações estratégicas.
                        Não serão enviadas notícias sobre vagas de emprego ou posts comuns de redes sociais.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Subscriber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Assinante</DialogTitle>
            <DialogDescription>
              Cadastre um novo email para receber alertas de notícias
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Search for existing users */}
            <div className="space-y-2">
              <Label>Buscar Usuário Cadastrado</Label>
              <Popover open={showSearchPopover} onOpenChange={setShowSearchPopover}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite nome ou email..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchPopover(true);
                      }}
                      onFocus={() => setShowSearchPopover(true)}
                      className="pl-9"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandList>
                      {isSearching ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : searchResults.length === 0 ? (
                        <CommandEmpty>
                          {searchQuery.length < 2 ? 'Digite ao menos 2 caracteres...' : 'Nenhum usuário encontrado'}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup heading="Usuários">
                          {searchResults.map((profile) => (
                            <CommandItem
                              key={profile.user_id}
                              onSelect={() => handleSelectProfile(profile)}
                              className="cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{profile.full_name}</span>
                                <span className="text-sm text-muted-foreground">{profile.email || 'Sem email'}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">Ou preencha manualmente abaixo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Nome do assinante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Tipo de Alertas</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instant"
                  checked={formData.receive_instant_alerts}
                  onCheckedChange={(checked) => setFormData({ ...formData, receive_instant_alerts: !!checked })}
                />
                <Label htmlFor="instant" className="text-sm font-normal">Alertas instantâneos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weekly"
                  checked={formData.receive_weekly_digest}
                  onCheckedChange={(checked) => setFormData({ ...formData, receive_weekly_digest: !!checked })}
                />
                <Label htmlFor="weekly" className="text-sm font-normal">Resumo semanal</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Filtrar por Tipo de Entidade</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="competitors"
                  checked={formData.entities_filter.competitors}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    entities_filter: { ...formData.entities_filter, competitors: !!checked }
                  })}
                />
                <Label htmlFor="competitors" className="text-sm font-normal">Concorrentes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prospects"
                  checked={formData.entities_filter.prospects}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    entities_filter: { ...formData.entities_filter, prospects: !!checked }
                  })}
                />
                <Label htmlFor="prospects" className="text-sm font-normal">Prospects</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clients"
                  checked={formData.entities_filter.clients}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    entities_filter: { ...formData.entities_filter, clients: !!checked }
                  })}
                />
                <Label htmlFor="clients" className="text-sm font-normal">Clientes</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSubscriber} disabled={!formData.email}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscriber Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Assinante</DialogTitle>
            <DialogDescription>
              Atualize as preferências do assinante
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                placeholder="Nome do assinante"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-3">
              <Label>Tipo de Alertas</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-instant"
                  checked={formData.receive_instant_alerts}
                  onCheckedChange={(checked) => setFormData({ ...formData, receive_instant_alerts: !!checked })}
                />
                <Label htmlFor="edit-instant" className="text-sm font-normal">Alertas instantâneos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-weekly"
                  checked={formData.receive_weekly_digest}
                  onCheckedChange={(checked) => setFormData({ ...formData, receive_weekly_digest: !!checked })}
                />
                <Label htmlFor="edit-weekly" className="text-sm font-normal">Resumo semanal</Label>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Filtrar por Tipo de Entidade</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-competitors"
                  checked={formData.entities_filter.competitors}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    entities_filter: { ...formData.entities_filter, competitors: !!checked }
                  })}
                />
                <Label htmlFor="edit-competitors" className="text-sm font-normal">Concorrentes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-prospects"
                  checked={formData.entities_filter.prospects}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    entities_filter: { ...formData.entities_filter, prospects: !!checked }
                  })}
                />
                <Label htmlFor="edit-prospects" className="text-sm font-normal">Prospects</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-clients"
                  checked={formData.entities_filter.clients}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    entities_filter: { ...formData.entities_filter, clients: !!checked }
                  })}
                />
                <Label htmlFor="edit-clients" className="text-sm font-normal">Clientes</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubscriber}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover o assinante <strong>{selectedSubscriber?.email}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubscriber}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit News Dialog */}
      <Dialog open={isEditNewsDialogOpen} onOpenChange={setIsEditNewsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Notícia</DialogTitle>
            <DialogDescription>Personalize o título e resumo antes de enviar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="news-title">Título</Label>
              <Input
                id="news-title"
                value={editingNews?.title || ''}
                onChange={(e) => setEditingNews(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-summary">Resumo</Label>
              <Textarea
                id="news-summary"
                value={editingNews?.summary || ''}
                onChange={(e) => setEditingNews(prev => prev ? { ...prev, summary: e.target.value } : null)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNewsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
              if (editingNews) {
                updateNewsItem(editingNews.id, { title: editingNews.title, summary: editingNews.summary });
                setIsEditNewsDialogOpen(false);
                setEditingNews(null);
              }
            }}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
