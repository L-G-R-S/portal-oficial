import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  email: string | null;
  app_role: AppRole;
}

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSuperAdmin, user: currentUser } = useAuth();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Buscar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, role, avatar_url, created_at, email")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combinar dados
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          app_role: (userRole?.role as AppRole) || "user",
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode alterar seu próprio role.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === userId ? { ...u, app_role: newRole } : u
        )
      );

      toast({
        title: "Role atualizado",
        description: `Usuário atualizado para ${newRole === "super_admin" ? "Super Admin" : "Usuário"}.`,
      });

      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Erro ao atualizar role",
        description: "Não foi possível atualizar o role do usuário.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode remover a si mesmo.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Chamar Edge Function para deletar completamente (inclui auth.users)
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData?.session?.access_token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar usuário');
      }

      setUsers((prev) => prev.filter((u) => u.user_id !== userId));

      toast({
        title: "Usuário removido",
        description: "O usuário foi removido completamente do sistema e não poderá mais fazer login.",
      });

      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erro ao remover usuário",
        description: error instanceof Error ? error.message : "Não foi possível remover o usuário.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    users,
    isLoading,
    updateUserRole,
    deleteUser,
    refetch: fetchUsers,
  };
}
