import { SharedAnalysisPage } from "@/components/analysis/SharedAnalysisPage";
import { ROUTES } from "@/lib/constants";

export default function AnaliseProspect() {
  return (
    <SharedAnalysisPage
      entityType="prospect"
      backRoute={ROUTES.PROSPECTS}
      backText="Ver lista de prospects"
      title="Análise de Prospect"
      description="Insira o domínio da empresa para realizar uma análise completa do prospect"
      insightText="Receba insights completos sobre o prospect"
    />
  );
}
