import { SharedAnalysisPage } from "@/components/analysis/SharedAnalysisPage";
import { ROUTES } from "@/lib/constants";

export default function AnaliseCliente() {
  return (
    <SharedAnalysisPage
      entityType="client"
      backRoute={ROUTES.CLIENTS}
      backText="Ver lista de clientes"
      title="Análise de Cliente"
      description="Insira o domínio da empresa para realizar uma análise completa do cliente"
      insightText="Receba insights completos sobre o cliente"
    />
  );
}
