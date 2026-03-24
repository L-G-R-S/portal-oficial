import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, ArrowLeft, ShieldAlert, Trash2 } from "lucide-react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfileAvatar, getInitials } from "@/hooks/useProfile";
import { useUserAction } from "@/hooks/useUserAction";
import { profileSchema, ProfileFormData } from "@/utils/validation";
import { AutoUpdateCard } from "@/components/settings/AutoUpdateCard";
import { PrimaryCompanySettings } from "@/components/settings/PrimaryCompanySettings";
import { PrimaryCompanySettingsReadOnly } from "@/components/settings/PrimaryCompanySettingsReadOnly";
import { KnowledgeBaseSettings } from "@/components/settings/KnowledgeBaseSettings";
import { UserManagementCard } from "@/components/settings/UserManagementCard";
import { EmailAlertsCard } from "@/components/settings/EmailAlertsCard";
import { LogsCard } from "@/components/settings/LogsCard";
import { ApiSettingsCard } from "@/components/settings/ApiSettingsCard";
import { UsageDashboardCard } from "@/components/settings/UsageDashboardCard";
import { SuperAdminOnly } from "@/components/SuperAdminOnly";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Settings() {
  const { profile, user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [role, setRole] = useState(profile?.role || "marketing");
  const { avatarUrl, isLoading: avatarLoading } = useProfileAvatar(profile?.user_id);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { trackAction } = useUserAction();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setRole(profile.role);
    }
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validar tamanho do arquivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 2MB.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Atualizar perfil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user?.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: publicUrl }));
      trackAction('upload_foto', 'Atualizou foto de perfil');
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível atualizar a foto.";
      toast({
        title: "Erro ao fazer upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsLoading(true);
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user?.id);

      if (updateError) throw updateError;

      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: null }));
      toast({
        title: "Foto removida",
        description: "Sua foto de perfil foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Remove avatar error:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a foto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setErrors({});
    setIsLoading(true);

    try {
      const profileData: ProfileFormData = profileSchema.parse({ full_name: fullName, role });

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          role: profileData.role,
        })
        .eq("user_id", profile?.user_id);

      if (error) throw error;

      trackAction('atualizacao_perfil', 'Atualizou dados do perfil');

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      // Aguardar um pouco antes de recarregar para o toast aparecer
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/')} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>Atualize sua foto de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={avatarUrl || undefined} 
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {uploading ? "Enviando..." : "Carregar Foto"}
                    </div>
                  </Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {avatarUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleRemoveAvatar}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Foto
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF (max. 2MB)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atualização Automática - Apenas Super Admin */}
          <SuperAdminOnly
            fallback={
              <Card className="opacity-60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    Atualização Automática
                  </CardTitle>
                  <CardDescription>
                    Apenas administradores podem gerenciar esta configuração
                  </CardDescription>
                </CardHeader>
              </Card>
            }
          >
            <AutoUpdateCard />
          </SuperAdminOnly>

          {/* Base de Conhecimento do Orbi - Apenas Super Admin */}
          <SuperAdminOnly
            fallback={
              <Card className="opacity-60">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    Base de Conhecimento
                  </CardTitle>
                  <CardDescription>
                    Apenas administradores podem gerenciar esta configuração
                  </CardDescription>
                </CardHeader>
              </Card>
            }
          >
            <KnowledgeBaseSettings />
          </SuperAdminOnly>



          {/* Gerenciamento de Usuários - Apenas Super Admin */}
          <SuperAdminOnly>
            <UsageDashboardCard />
            <div className="mt-6" />
            <UserManagementCard />
          </SuperAdminOnly>

          {/* Configuração de API (IA / Gemini) - Apenas Super Admin */}
          <SuperAdminOnly>
            <ApiSettingsCard />
          </SuperAdminOnly>
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Setor</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="executivo">Executivo</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="coe_sap">COE SAP</SelectItem>
                    <SelectItem value="coe_qa">COE QA</SelectItem>
                    <SelectItem value="people">People</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="inovacao">Inovação</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role}</p>
                )}
              </div>

              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Empresa Principal - Read-only para usuários normais */}
          <SuperAdminOnly fallback={<PrimaryCompanySettingsReadOnly />}>
            <PrimaryCompanySettings />
          </SuperAdminOnly>

          {/* Alertas por Email - Apenas Super Admin */}
          <SuperAdminOnly>
            <EmailAlertsCard />
          </SuperAdminOnly>

          {/* Logs de Atividade - Apenas Super Admin */}
          <SuperAdminOnly>
            <LogsCard />
          </SuperAdminOnly>
        </div>
      </div>
    </div>
  );
}