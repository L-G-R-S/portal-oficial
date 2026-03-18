import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Loader2, Search, RefreshCw, Trash2, Users, Linkedin, Instagram, Youtube, ExternalLink, Eye } from "lucide-react";
import { usePrimaryCompany } from "@/hooks/usePrimaryCompany";
import { useAnalysisContext } from "@/contexts/AnalysisContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ROUTES } from "@/lib/constants";
import { formatNumber } from "@/lib/formatters";

export function PrimaryCompanySettings() {
  const [domain, setDomain] = useState("");
  const navigate = useNavigate();
  const { primaryCompany, isLoading, loadPrimaryCompany, savePrimaryCompany, removePrimaryCompany } = usePrimaryCompany();
  const { startAnalysis, isAnalyzing, analyses } = useAnalysisContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAnalyzing, setWasAnalyzing] = useState(false);

  // Detecta quando uma análise é concluída e recarrega os dados
  const currentDomainAnalyzing = primaryCompany?.domain ? isAnalyzing(primaryCompany.domain) : false;
  
  useEffect(() => {
    // Se estava analisando e parou, recarregar dados múltiplas vezes para garantir
    if (wasAnalyzing && !currentDomainAnalyzing) {
      console.log("Analysis completed, reloading primary company data...");
      loadPrimaryCompany();
      // Reload again after delays to ensure data is updated
      setTimeout(() => {
        console.log("Reloading primary company data (2s delay)...");
        loadPrimaryCompany();
      }, 2000);
      setTimeout(() => {
        console.log("Reloading primary company data (5s delay)...");
        loadPrimaryCompany();
      }, 5000);
    }
    setWasAnalyzing(currentDomainAnalyzing);
  }, [currentDomainAnalyzing, wasAnalyzing, loadPrimaryCompany]);

  // Também monitora todas as análises para detectar quando a análise do domain termina
  useEffect(() => {
    const checkAnalysisComplete = () => {
      if (primaryCompany?.domain && !analyses.has(primaryCompany.domain) && wasAnalyzing) {
        console.log("Analysis for primary company completed, reloading...");
        loadPrimaryCompany();
        setTimeout(() => loadPrimaryCompany(), 2000);
        setTimeout(() => loadPrimaryCompany(), 5000);
        setWasAnalyzing(false);
      }
    };
    checkAnalysisComplete();
  }, [analyses, primaryCompany?.domain, wasAnalyzing, loadPrimaryCompany]);

  const handleAnalyze = async () => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    
    if (!cleanDomain) {
      toast({
        title: "Domínio inválido",
        description: "Por favor, insira um domínio válido.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save the domain first
      const primaryId = await savePrimaryCompany(cleanDomain);
      if (primaryId) {
        // Start the analysis
        setWasAnalyzing(true);
        await startAnalysis(cleanDomain, 'primary');
        setDomain("");
        // Reload to show domain configured
        await loadPrimaryCompany();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!primaryCompany?.domain) return;
    setWasAnalyzing(true);
    await startAnalysis(primaryCompany.domain, 'primary');
  };

  const handleRemove = async () => {
    await removePrimaryCompany();
  };

  const isCurrentlyAnalyzing = primaryCompany?.domain ? isAnalyzing(primaryCompany.domain) : false;
  const isNewDomainAnalyzing = domain && isAnalyzing(domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Empresa Principal
          </CardTitle>
          <CardDescription>Configure sua empresa para análises comparativas</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Empresa Principal
        </CardTitle>
        <CardDescription>
          Configure sua empresa para análises comparativas no Dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input para novo domínio ou atualização */}
        {!primaryCompany && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio da Empresa</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="exemplo.com.br"
                  disabled={isSubmitting || !!isNewDomainAnalyzing}
                  className="flex-1"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!domain.trim() || isSubmitting || !!isNewDomainAnalyzing}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting || isNewDomainAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Analisar</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Insira o domínio da sua empresa (sem http:// ou www.)
              </p>
            </div>
          </div>
        )}

        {/* Exibição da empresa configurada */}
        {primaryCompany && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                Empresa Configurada
              </Badge>
              {isCurrentlyAnalyzing && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Analisando...
                </Badge>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
              <Avatar className="h-12 w-12">
                <AvatarImage src={primaryCompany.logo_url || undefined} alt={primaryCompany.name || ""} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {primaryCompany.name?.substring(0, 2).toUpperCase() || primaryCompany.domain?.substring(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {primaryCompany.name || primaryCompany.domain}
                  </h3>
                  {primaryCompany.industry && (
                    <p className="text-sm text-muted-foreground">{primaryCompany.industry}</p>
                  )}
                  {primaryCompany.headquarters && (
                    <p className="text-sm text-muted-foreground">{primaryCompany.headquarters}</p>
                  )}
                </div>

                {primaryCompany.employee_count && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{formatNumber(primaryCompany.employee_count)} funcionários</span>
                  </div>
                )}

                {/* Social metrics */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {primaryCompany.linkedin_followers && (
                    <div className="flex items-center gap-1 text-sm">
                      <Linkedin className="h-4 w-4 text-[#0077b5]" />
                      <span>{formatNumber(primaryCompany.linkedin_followers)}</span>
                    </div>
                  )}
                  {primaryCompany.instagram_followers && (
                    <div className="flex items-center gap-1 text-sm">
                      <Instagram className="h-4 w-4 text-[#E4405F]" />
                      <span>{formatNumber(primaryCompany.instagram_followers)}</span>
                    </div>
                  )}
                  {primaryCompany.youtube_subscribers && (
                    <div className="flex items-center gap-1 text-sm">
                      <Youtube className="h-4 w-4 text-[#FF0000]" />
                      <span>{formatNumber(primaryCompany.youtube_subscribers)}</span>
                    </div>
                  )}
                </div>

                {primaryCompany.analyzed_at && (
                  <p className="text-xs text-muted-foreground pt-2">
                    Última análise: {format(new Date(primaryCompany.analyzed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}

                {!primaryCompany.analyzed_at && !isCurrentlyAnalyzing && (
                  <p className="text-xs text-yellow-600 pt-2">
                    Aguardando análise...
                  </p>
                )}

                {primaryCompany.website && (
                  <a
                    href={primaryCompany.website.startsWith("http") ? primaryCompany.website : `https://${primaryCompany.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {primaryCompany.domain}
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                onClick={() => navigate(`${ROUTES.PRIMARY_COMPANY_DETAIL}/${primaryCompany.id}`)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleUpdate}
                  disabled={isCurrentlyAnalyzing}
                  className="flex-1 sm:flex-none"
                >
                  {isCurrentlyAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isCurrentlyAnalyzing}
                  className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
