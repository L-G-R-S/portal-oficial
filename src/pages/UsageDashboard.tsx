import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ActivitySquare, Users, TrendingUp, UserCheck, ShieldAlert, Search, Filter, Download, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { generateUsageReport } from "@/utils/usageReportGenerator";
import { useUserAction } from "@/hooks/useUserAction";
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
import { cn } from "@/lib/utils";

type UsageLog = {
  id: string;
  user_id: string;
  role: string;
  action_type: string;
  page_path: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

type UserStats = {
  totalUsers: number;
  activeUsersMonth: number;
  slaPercentage: number;
  leaderSla: number;
  salesSla: number;
};

const getCurrentMonthString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function UsageDashboard() {
  const navigate = useNavigate();
  const { trackAction } = useUserAction();
  
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsersMonth: 0,
    slaPercentage: 0,
    leaderSla: 0,
    salesSla: 0
  });
  const [loading, setLoading] = useState(true);
  
  // New Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [filterMonth, setFilterMonth] = useState(getCurrentMonthString());
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  // Loading States for Buttons
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterMonth]); // Refetch when month changes

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Calculate start and end of selected month
      const [yearStr, monthStr] = filterMonth.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr) - 1;
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
      
      // Fetch total users and profiles
      const { data: allProfiles, error: profileErr } = await supabase.from('profiles').select('*');
      if (profileErr) throw profileErr;
      
      // Exclui administradores (administrador e super_admin via roles) dos cálculos
      // Exclui administradores (administrador e super_admin via roles) dos cálculos
      const profiles = allProfiles?.filter(p => (p.role as string) !== 'administrador') || [];
      const totalUsers = profiles.length;
      
      // Extrai roles dinâmicas do banco (das contas que não são super_admin)
      const uniqueRoles = [...new Set(profiles.map(p => p.role).filter(Boolean))];
      setAvailableRoles(uniqueRoles as string[]);
      
      // Fetch logs of the selected month (excluindo super admins)
      const { data: recentLogs, error: logsErr } = await supabase
        .from('user_usage_logs')
        .select(`
          id, user_id, role, action_type, page_path, created_at,
          profiles (full_name)
        `)
        .neq('role', 'super_admin')
        .neq('role', 'administrador')
        .neq('action_type', 'page_view')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(200);
        
      if (logsErr) throw logsErr;
      setLogs(recentLogs as any || []);
      
      // Fetch unique active users in this month (excluindo super_admin)
      const { data: activeLogs } = await supabase
        .from('user_usage_logs')
        .select('user_id, role')
        .neq('role', 'super_admin')
        .neq('role', 'administrador')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
        
      const activeUserIds = new Set(activeLogs?.map(log => log.user_id));
      const activeUsersMonth = activeUserIds.size;
      const slaPercentage = totalUsers ? Math.round((activeUsersMonth / totalUsers) * 100) : 0;
      
      // Calculate by role
      const executivesTotal = profiles.filter(p => p.role === 'executivo').length;
      const salesTotal = profiles.filter(p => p.role === 'comercial').length;
      
      const activeExecutives = new Set(activeLogs?.filter(l => l.role === 'executivo').map(l => l.user_id)).size;
      const activeSales = new Set(activeLogs?.filter(l => l.role === 'comercial').map(l => l.user_id)).size;
      
      const leaderSla = executivesTotal ? Math.round((activeExecutives / executivesTotal) * 100) : 0;
      const salesSla = salesTotal ? Math.round((activeSales / salesTotal) * 100) : 0;

      setStats({
        totalUsers,
        activeUsersMonth,
        slaPercentage,
        leaderSla,
        salesSla
      });
      
    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast.error('Erro ao carregar dados de uso');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      generateUsageReport(filteredLogs, stats, filterMonth);
      trackAction('download_pdf', 'Exportou PDF de Uso da Plataforma');
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllLogs = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('user_usage_logs')
        .delete()
        .neq('role', 'super_admin')
        .neq('role', 'administrador'); // Só apaga os logs de usuários normais
        
      if (error) throw error;
      
      toast.success('Todos os logs da equipe foram limpos com sucesso');
      fetchData(); // Reloads empty table
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast.error('Erro ao limpar logs');
    } finally {
      setIsClearing(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'executivo': return <Badge variant="default" className="bg-purple-600">Liderança</Badge>;
      case 'comercial': return <Badge variant="default" className="bg-blue-600">Comercial</Badge>;
      case 'marketing': return <Badge variant="secondary">Marketing</Badge>;
      case 'inovacao': return <Badge variant="outline" className="border-cyan-500 text-cyan-600">Inovação</Badge>;
      case 'financas': return <Badge variant="outline" className="border-green-500 text-green-600">Finanças</Badge>;
      case 'people': return <Badge variant="outline" className="border-pink-500 text-pink-600">People</Badge>;
      case 'backoffice': return <Badge variant="outline" className="border-gray-500 text-gray-600">Back Office</Badge>;
      default: return <Badge variant="outline" className="capitalize">{role}</Badge>;
    }
  };

  const getSlaColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getActionLabel = (action_type: string) => {
    const map: Record<string, string> = {
      login: 'Login',
      logout: 'Saiu',
      orb_chat: 'Conversou com o Orb',
      nova_analise: 'Nova Análise',
      download_pdf: 'Download PDF',
      novo_concorrente: 'Criou Concorrente',
      atualizacao_perfil: 'Atualizou Perfil',
      upload_foto: 'Atualizou Foto',
      page_view: 'Navegação'
    };
    return map[action_type] || action_type;
  };

  const filteredLogs = logs.filter(log => {
    const userName = log.profiles?.full_name?.toLowerCase() || '';
    const matchesSearch = userName.includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || log.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 lg:p-6 pb-[200px]">
      {/* Header com botões semelhantes aos da página Logs.tsx */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/settings')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <ActivitySquare className="h-6 w-6 text-primary" />
              Uso da Plataforma
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Métricas de adoção e relatórios de acesso da equipe
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} size="sm" className="sm:size-default">
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
              <Button variant="destructive" disabled={isClearing || logs.length === 0} size="sm" className="sm:size-default">
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
                  Esta ação irá remover permanentemente todos os registros de uso da equipe. 
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

      {!loading && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Meta de Uso (70%)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.slaPercentage}%</div>
                <Progress 
                  value={stats.slaPercentage} 
                  className="mt-2"
                  indicatorClassName={getSlaColor(stats.slaPercentage)} 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.activeUsersMonth} de {stats.totalUsers} usuários ativos no mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Adesão Liderança</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leaderSla}%</div>
                <Progress 
                  value={stats.leaderSla} 
                  className="mt-2"
                  indicatorClassName={getSlaColor(stats.leaderSla)} 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Usuários 'executivo' ativos no mês
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Adesão Comercial</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.salesSla}%</div>
                <Progress 
                  value={stats.salesSla} 
                  className="mt-2"
                  indicatorClassName={getSlaColor(stats.salesSla)} 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Usuários 'comercial' ativos no mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total da Equipe</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Usuários cadastrados (excl. Super Admins)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Acessos e Ações da Equipe</CardTitle>
                  <CardDescription>Registro de interação na plataforma no período selecionado.</CardDescription>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar por nome do usuário..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 max-w-md"
                  />
                </div>
                
                {/* Dynamic Filters */}
                <div className="flex items-center gap-2">
                  <div className="w-full sm:w-48">
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Filtrar por Área" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Áreas</SelectItem>
                        {availableRoles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-48">
                    <Input 
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Área</TableHead>
                      <TableHead>Tipo de Ação</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead className="text-right">Acesso Em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          {logs.length === 0 ? "Nenhuma ação registrada para este mês." : "Nenhum resultado para os filtros atuais."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">
                            {log.profiles?.full_name || 'Usuário Desconhecido'}
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(log.role)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-sm">
                              {getActionLabel(log.action_type)}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm" title={log.page_path}>
                            {log.page_path}
                          </TableCell>
                          <TableCell className="text-right whitespace-nowrap text-muted-foreground text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
