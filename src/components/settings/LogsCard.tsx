import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function LogsCard() {
  const navigate = useNavigate();

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Logs de Análise
        </CardTitle>
        <CardDescription>
          Visualize o histórico completo de execuções, erros e status das análises manuais e automáticas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => navigate(ROUTES.LOGS)} 
          className="w-full group"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          Ver Todos os Logs
          <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </CardContent>
    </Card>
  );
}
