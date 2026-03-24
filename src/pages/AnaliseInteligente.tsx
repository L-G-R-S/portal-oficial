import { SharedAnalysisPage } from "@/components/analysis/SharedAnalysisPage";
import { ROUTES } from "@/lib/constants";

export default function AnaliseInteligente() {
  return (
    <SharedAnalysisPage
      entityType="competitor"
      backRoute={ROUTES.COMPETITORS}
      backText="Ver lista de concorrentes"
      title="Análise de Concorrente"
      description="Insira o domínio da empresa para realizar uma análise competitiva completa"
      insightText="Receba insights completos sobre o concorrente"
    />
  );
}
