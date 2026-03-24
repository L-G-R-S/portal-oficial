import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Shield, User, RefreshCw, Pencil, Trash2, Mail, ChevronLeft, Users, UserCheck, Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getInitials } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";
import { ROUTES } from "@/lib/constants";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  app_role: AppRole;
  email?: string;
}

const roleLabels: Record<string, string> = {
  marketing: "Marketing",
  comercial: "Comercial",
  executivo: "Executivo",
  delivery: "Delivery",
  coe_sap: "COE SAP",
  coe_qa: "COE QA",
  people: "People",
  financeiro: "Financeiro",
  inovacao: "Inovação",
  administrador: "Administrador",
};

export default function UserManagement() {
  const navigate = useNavigate();
  const { users, isLoading, updateUserRole, deleteUser, refetch } = useUserManagement();
  const { user: currentUser } = useAuth();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  // Compute stats
  const totalUsers = users.length;
  const superAdmins = users.filter(u => u.app_role === "super_admin").length;
  const regularUsers = users.filter(u => u.app_role === "user").length;
  const thisMonthUsers = users.filter(u => {
    const createdDate = new Date(u.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;

  const confirmRoleChange = async () => {
    if (!editingUser || !selectedRole || selectedRole === editingUser.app_role) return;
    
    setUpdatingUserId(editingUser.user_id);
    const success = await updateUserRole(editingUser.user_id, selectedRole);
    setUpdatingUserId(null);
    
    if (success) {
      setEditingUser({ ...editingUser, app_role: selectedRole });
      setSelectedRole(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUserId(userToDelete.user_id);
    const success = await deleteUser(userToDelete.user_id);
    setDeletingUserId(null);
    if (success) {
      setUserToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const openEditDialog = (user: UserWithRole) => {
    setEditingUser(user);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(ROUTES.SETTINGS)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize, edite permissões e remova usuários do sistema
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalUsers}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-primary">{superAdmins}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários Comuns</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{regularUsers}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cadastrados (Mês)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{thisMonthUsers}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const isCurrentUser = user.user_id === currentUser?.id;

                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(user.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.full_name}</span>
                                {isCurrentUser && (
                                  <span className="text-xs text-muted-foreground">(você)</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.app_role === "super_admin" ? "default" : "secondary"}>
                              {user.app_role === "super_admin" ? (
                                <><Shield className="h-3 w-3 mr-1" /> Super Admin</>
                              ) : (
                                <><User className="h-3 w-3 mr-1" /> Usuário</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell className="text-right">
                            {!isCurrentUser && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(user)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setShowDeleteConfirm(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Visualize e altere as configurações do usuário
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-6 py-4">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={editingUser.avatar_url || undefined} alt={editingUser.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {getInitials(editingUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{editingUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {roleLabels[editingUser.role] || editingUser.role}
                  </p>
                </div>
              </div>

              {/* E-mail (somente leitura) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail
                </label>
                <p className="text-sm bg-muted/50 px-3 py-2 rounded-md">
                  {editingUser.email || "Não disponível"}
                </p>
              </div>

              {/* Setor (somente leitura) */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Setor</label>
                <p className="text-sm bg-muted/50 px-3 py-2 rounded-md">
                  {roleLabels[editingUser.role] || editingUser.role}
                </p>
              </div>

              {/* Permissão do Sistema */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Permissão do Sistema</label>
                <Select
                  value={selectedRole ?? editingUser.app_role}
                  onValueChange={(value: AppRole) => setSelectedRole(value)}
                  disabled={updatingUserId === editingUser.user_id}
                >
                  <SelectTrigger>
                    {updatingUserId === editingUser.user_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SelectValue />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Usuário
                      </div>
                    </SelectItem>
                    <SelectItem value="super_admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Super Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Super Admins têm acesso total ao sistema, incluindo configurações da empresa principal.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmRoleChange}
                  disabled={!selectedRole || selectedRole === editingUser.app_role || !!updatingUserId}
                >
                  {updatingUserId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={(open) => {
        setShowDeleteConfirm(open);
        if (!open) setUserToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{userToDelete?.full_name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingUserId}
            >
              {deletingUserId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
