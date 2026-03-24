import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2, Clock, ArrowRight } from "lucide-react";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ROUTES } from "@/lib/constants";

export function AutoUpdateCard() {
  const navigate = useNavigate();
  const { settings, isLoading, isUpdating } = useUpdateSettings();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const nextUpdateText = settings?.next_update_at && settings.is_enabled
    ? formatDistanceToNow(new Date(settings.next_update_at), { addSuffix: true, locale: ptBR })
    : 'Não agendado';

  const lastUpdateText = settings?.last_update_at
    ? formatDistanceToNow(new Date(settings.last_update_at), { addSuffix: true, locale: ptBR })
    : 'Nunca';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin text-primary' : ''}`} />
          Atualização Automática
        </CardTitle>
        <CardDescription>
          Configure atualizações automáticas de entidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={settings?.is_enabled ? "default" : "secondary"}>
            {settings?.is_enabled ? 'Ativo' : 'Desativado'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="text-sm text-muted-foreground">Última atualização</span>
          <span className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {lastUpdateText}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="text-sm text-muted-foreground">Próxima atualização</span>
          <span className="text-sm font-medium">
            {isUpdating ? (
              <span className="flex items-center gap-1 text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                Em andamento
              </span>
            ) : (
              nextUpdateText
            )}
          </span>
        </div>

        <Button 
          onClick={() => navigate(ROUTES.AUTO_UPDATES)} 
          className="w-full mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Gerenciar Atualizações
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
