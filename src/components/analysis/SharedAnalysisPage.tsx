import { useState, useEffect, useRef } from "react";
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

interface SharedAnalysisPageProps {
  entityType: "competitor" | "prospect" | "client";
  backRoute: string;
  backText: string;
  title: string;
  description: string;
  insightText: string;
}

export function SharedAnalysisPage({
  entityType,
  backRoute,
  backText,
  title,
  description,
  insightText
}: SharedAnalysisPageProps) {
  const [companyInput, setCompanyInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { startAnalysis, isAnalyzing, onAnalysisComplete } = useAnalysisContext();

  // Track the last domain submitted so we can subscribe to its completion
  const pendingDomainRef = useRef<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  useEffect(() => {
    const state = location.state as { domain?: string; prefillDomain?: string; autoStart?: boolean } | null;
    const initialDomain = state?.prefillDomain || state?.domain;
    
    if (initialDomain) {
      setCompanyInput(initialDomain);
      if (state?.autoStart && !isAnalyzing(initialDomain)) {
        const cleaned = cleanDomain(initialDomain);
        if (isValidDomain(cleaned)) {
          submitDomain(cleaned);
        }
      }
      if (state?.prefillDomain) {
        window.history.replaceState({}, document.title);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const submitDomain = (domain: string) => {
    // Unsubscribe previous listener if any
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }

    pendingDomainRef.current = domain;

    // Subscribe to completion for this domain BEFORE starting
    const unsub = onAnalysisComplete(domain, (_entityId, route) => {
      navigate(route);
    });
    unsubRef.current = unsub;

    startAnalysis(domain, entityType);
  };

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

    submitDomain(cleanedDomain);
  };

  return (
    <div className="space-y-6">
      <AnalysisProgressBanner entityType={entityType} />

      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(backRoute)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {backText}
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
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
                {insightText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
