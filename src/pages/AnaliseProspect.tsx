import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisContext } from "@/contexts/AnalysisContext";
import { AnalysisProgressBanner } from "@/components/competitor/AnalysisProgressBanner";

function isValidDomain(input: string): boolean {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(input);
}

function cleanDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  cleaned = cleaned.split('/')[0];
  return cleaned;
}

export default function AnaliseProspect() {
  const [companyInput, setCompanyInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { analyses, startAnalysis, cancelAnalysis } = useAnalysisContext();

  // Get current analysis for this entity type
  const currentAnalysis = Array.from(analyses.values()).find(a => a.entityType === 'prospect' && a.status === 'analyzing');

  useEffect(() => {
    const state = location.state as { domain?: string } | null;
    if (state?.domain) {
      setCompanyInput(state.domain);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    const cleanedDomain = cleanDomain(companyInput);
    
    if (!cleanedDomain) {
      setValidationError("Por favor, insira um domínio válido");
      toast({
        title: "Domínio inválido",
        description: "Por favor, insira o domínio da empresa (ex: empresa.com.br)",
        variant: "destructive",
      });
      return;
    }

    if (!isValidDomain(cleanedDomain)) {
      setValidationError("Formato de domínio inválido. Use o formato: empresa.com.br");
      toast({
        title: "Formato inválido",
        description: "Use o formato correto: empresa.com.br",
        variant: "destructive",
      });
      return;
    }

    startAnalysis(cleanedDomain, 'prospect');
  };

  return (
    <div className="space-y-6">
      <AnalysisProgressBanner entityType="prospect" />

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/prospects")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver lista de prospects
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Prospect</h1>
        <p className="text-muted-foreground">
          Insira o domínio da empresa para realizar uma análise completa do prospect
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Nova Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Domínio da Empresa
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="Ex: empresa.com.br ou empresa.com"
                value={companyInput}
                onChange={(e) => {
                  setCompanyInput(e.target.value);
                  setValidationError(null);
                }}
                className={`w-full ${validationError ? 'border-destructive' : ''}`}
              />
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!companyInput.trim()}
            >
              Analisar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Insira o domínio</h3>
              <p className="text-sm text-muted-foreground">
                Digite o domínio da empresa (ex: empresa.com.br)
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Processamento</h3>
              <p className="text-sm text-muted-foreground">
                Coletamos dados de múltiplas fontes
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Relatório</h3>
              <p className="text-sm text-muted-foreground">
                Receba insights completos sobre o prospect
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
