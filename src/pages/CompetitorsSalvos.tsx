import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEntities } from "@/hooks/useEntities";
import { useAnalysisContext } from "@/contexts/AnalysisContext";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import { UnifiedEntityCard } from "@/components/entity/UnifiedEntityCard";
import { AnalysisProgressBanner } from "@/components/competitor/AnalysisProgressBanner";

export default function CompetitorsSalvos() {
  const navigate = useNavigate();
  const { entities: competitors, isLoading, deleteEntity } = useEntities("competitor");
  const { startAnalysis, isAnalyzing } = useAnalysisContext();

  return (
    <div className="space-y-6">
      <AnalysisProgressBanner entityType="competitor" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Concorrentes Salvos</h1>
          <p className="text-muted-foreground">
            Lista de análises salvas de concorrentes
          </p>
        </div>
        <Button 
          onClick={() => navigate(ROUTES.ANALISE_INTELIGENTE)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Nenhum concorrente salvo ainda.
            </p>
            <Button onClick={() => navigate(ROUTES.ANALISE_INTELIGENTE)}>
              Fazer primeira análise
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((competitor) => (
            <UnifiedEntityCard
              key={competitor.id}
              entity={competitor}
              entityType="competitor"
              isUpdating={isAnalyzing(competitor.domain)}
              onUpdate={(domain) => startAnalysis(domain)}
              onDelete={() => deleteEntity(competitor.id, competitor.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
