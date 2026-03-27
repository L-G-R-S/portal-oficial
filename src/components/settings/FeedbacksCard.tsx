import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function FeedbacksCard() {
  const navigate = useNavigate();

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Feedbacks e Problemas
        </CardTitle>
        <CardDescription>
          Gerencie os relatos, sugestões e erros enviados pelos usuários da plataforma.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={() => navigate(ROUTES.FEEDBACKS as any)} 
          className="w-full group"
          variant="outline"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Ver Todos os Feedbacks
          <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </CardContent>
    </Card>
  );
}
