import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAnalysisContext, EntityType, AnalysisState } from "@/contexts/AnalysisContext";

const entityRoutes: Record<EntityType, string> = {
  competitor: ROUTES.ANALISE_INTELIGENTE,
  prospect: '/analise-prospect',
  client: '/analise-cliente',
  primary: '/configuracoes',
};

interface AnalysisProgressBannerProps {
  entityType?: EntityType;
  showAll?: boolean;
}

function SingleAnalysisBanner({ 
  analysis, 
  onCancel 
}: { 
  analysis: AnalysisState; 
  onCancel: (domain: string) => void;
}) {
  const navigate = useNavigate();
  const route = entityRoutes[analysis.entityType];

  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Análise em andamento: {analysis.domain}</p>
        <p className="text-xs text-muted-foreground">{analysis.message}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(route)}
        >
          Ver progresso
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onCancel(analysis.domain)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AnalysisProgressBanner({ entityType, showAll = false }: AnalysisProgressBannerProps) {
  const { analyses, cancelAnalysis } = useAnalysisContext();

  const activeAnalyses = Array.from(analyses.values()).filter(a => a.status === 'analyzing');

  if (activeAnalyses.length === 0) {
    return null;
  }

  // Filter by entity type if specified
  const filteredAnalyses = entityType && !showAll
    ? activeAnalyses.filter(a => a.entityType === entityType)
    : activeAnalyses;

  if (filteredAnalyses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {filteredAnalyses.map((analysis) => (
        <SingleAnalysisBanner 
          key={analysis.id} 
          analysis={analysis} 
          onCancel={cancelAnalysis}
        />
      ))}
    </div>
  );
}
