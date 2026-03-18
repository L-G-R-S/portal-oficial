import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, ArrowLeft, Loader2, X } from "lucide-react";
import { useAnalysisContext } from "@/contexts/AnalysisContext";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import { AnalysisProgressBanner } from "@/components/competitor/AnalysisProgressBanner";

// Validate if input is a valid domain
const isValidDomain = (input: string): boolean => {
  // Remove protocol if present
  const cleanInput = input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  
  // Check if it has a dot and a valid TLD pattern
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/;
  return domainRegex.test(cleanInput);
};

// Clean domain input (remove protocol, www, paths)
const cleanDomain = (input: string): string => {
  return input.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase().trim();
};

export default function AnaliseInteligente() {
  const [companyInput, setCompanyInput] = useState("");
  const [validationError, setValidationError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { analyses, isAnalyzing, startAnalysis, cancelAnalysis } = useAnalysisContext();

  // Get current domain being analyzed (for this entity type)
  const currentAnalysis = Array.from(analyses.values()).find(a => a.entityType === 'competitor' && a.status === 'analyzing');
  const isCurrentlyAnalyzing = !!currentAnalysis;

  // Auto-start analysis if domain is passed via state
  useEffect(() => {
    const state = location.state as { prefillDomain?: string; autoStart?: boolean } | null;
    if (state?.prefillDomain) {
      setCompanyInput(state.prefillDomain);
      // Auto-start if autoStart flag is set
      if (state.autoStart && !isAnalyzing(state.prefillDomain)) {
        const cleaned = cleanDomain(state.prefillDomain);
        if (isValidDomain(cleaned)) {
          startAnalysis(cleaned);
        }
      }
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, startAnalysis, isAnalyzing]);

  // Clear validation error when input changes
  useEffect(() => {
    if (validationError) {
      setValidationError("");
    }
  }, [companyInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInput.trim()) return;
    
    const cleaned = cleanDomain(companyInput.trim());
    
    if (!isValidDomain(cleaned)) {
      setValidationError("Por favor, insira um domínio válido (ex: empresa.com.br)");
      toast.error("Domínio inválido", {
        description: "Insira um domínio válido como empresa.com ou empresa.com.br"
      });
      return;
    }
    
    setValidationError("");
    await startAnalysis(cleaned);
  };

  const handleCancel = () => {
    if (currentAnalysis) {
      cancelAnalysis(currentAnalysis.domain);
    }
  };

  return (
    <div className="space-y-6">
      <AnalysisProgressBanner entityType="competitor" />

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(ROUTES.COMPETITORS)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver lista de concorrentes
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Concorrente</h1>
        <p className="text-muted-foreground">
          Insira o domínio da empresa para realizar uma análise competitiva completa
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
                onChange={(e) => setCompanyInput(e.target.value)}
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
                Receba insights completos sobre o concorrente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
