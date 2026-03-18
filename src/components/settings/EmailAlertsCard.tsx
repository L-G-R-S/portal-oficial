import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useEmailSubscribers } from "@/hooks/useEmailSubscribers";
import { ROUTES } from "@/lib/constants";

export function EmailAlertsCard() {
  const navigate = useNavigate();
  const { stats, loading } = useEmailSubscribers();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          Alertas por Email <span className="text-xs font-normal text-muted-foreground">(Desativado)</span>
        </CardTitle>
        <CardDescription>
          {loading 
            ? "Carregando..."
            : `${stats.activeSubscribers} assinante${stats.activeSubscribers !== 1 ? 's' : ''} ativo${stats.activeSubscribers !== 1 ? 's' : ''} • ${stats.emailsSentThisMonth} emails enviados este mês`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate(ROUTES.EMAIL_ALERTS)} className="w-full">
          <Mail className="h-4 w-4 mr-2" />
          Gerenciar Alertas
        </Button>
      </CardContent>
    </Card>
  );
}
