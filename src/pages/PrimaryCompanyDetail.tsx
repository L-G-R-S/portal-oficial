import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEntityDetail } from "@/hooks/useEntityDetail";
import { EntityDetailContent } from "@/components/entity/EntityDetailContent";
import { generateCompetitorReport } from "@/utils/pdfReportGenerator";
import { useToast } from "@/hooks/use-toast";
import { ROUTES } from "@/lib/constants";
import { InlineChat } from "@/components/chat";

export default function PrimaryCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isLoading, data, reload } = useEntityDetail("primary", id);
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    if (!data) return;
    setIsGeneratingPDF(true);
    try {
      await generateCompetitorReport({
        competitor: null,
        company: data.entity,
        glassdoor: data.glassdoor,
        marketResearch: data.marketResearch,
        leadership: data.leadership,
        similarCompanies: data.similarCompanies,
        marketNews: data.marketNews,
        socialPosts: data.socialPosts,
      });
      toast({
        title: "PDF gerado com sucesso",
        description: "O download foi iniciado automaticamente.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(ROUTES.SETTINGS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate(ROUTES.SETTINGS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Empresa principal não encontrada.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(ROUTES.SETTINGS)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
        </Button>
      </div>

      <EntityDetailContent 
        data={data} 
        showPdfButton={false}
        entityId={id}
        entityType="primary"
        domain={data.entity?.domain}
        onRefresh={reload}
      />

      <InlineChat 
        entityId={id!}
        entityType="primary"
        entityName={data.entity?.name || data.entity?.domain}
      />
    </div>
  );
}
