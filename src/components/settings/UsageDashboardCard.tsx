import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivitySquare } from "lucide-react";

export function UsageDashboardCard() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <ActivitySquare className="h-5 w-5" />
          Uso da Plataforma
        </CardTitle>
        <CardDescription>
          Visualize métricas de adesão, como acessos recentes e engajamento da equipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate('/platform-usage')} className="w-full">
          <ActivitySquare className="h-4 w-4 mr-2" />
          Acessar Relatório
        </Button>
      </CardContent>
    </Card>
  );
}
