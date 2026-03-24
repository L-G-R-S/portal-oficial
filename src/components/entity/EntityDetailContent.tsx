import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  MapPin,
  Users,
  Calendar,
  Star,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Building2,
  Phone,
  FileDown,
  Loader2,
} from "lucide-react";
import type { EntityDetailData } from "@/hooks/useEntityDetail";
import { generateCompetitorReport } from "@/utils/pdfReportGenerator";
import { useUpdateNews } from "@/hooks/useUpdateNews";
import { isValidUrl } from "@/utils/helpers";

// Import tab components
import { OverviewTab } from "./tabs/OverviewTab";
import { RedesSociaisTab } from "./tabs/RedesSociaisTab";
import { GlassdoorTab } from "./tabs/GlassdoorTab";
import { MercadoTab } from "./tabs/MercadoTab";

interface EntityDetailContentProps {
  data: EntityDetailData;
  showPdfButton?: boolean;
  entityId?: string;
  entityType?: 'competitor' | 'prospect' | 'client' | 'primary';
  domain?: string;
  onRefresh?: () => void;
}

export function EntityDetailContent({ 
  data, 
  showPdfButton = true,
  entityId,
  entityType,
  domain,
  onRefresh,
}: EntityDetailContentProps) {
  const { entity, glassdoor, marketResearch, similarCompanies, marketNews, leadership, socialPosts } = data;
  const { toast } = useToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { isUpdating: isUpdatingNews, updateNews } = useUpdateNews();
  const specialties = entity?.linkedin_specialties || [];

  // Remove duplicates from similar companies
  const uniqueSimilarCompanies = similarCompanies.filter(
    (company, index, self) =>
      index === self.findIndex((c) => c.name === company.name)
  );

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateCompetitorReport({
        competitor: null,
        company: entity,
        glassdoor,
        marketResearch,
        leadership,
        similarCompanies: uniqueSimilarCompanies,
        marketNews,
        socialPosts,
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

  return (
    <>
      {/* PDF Download Button */}
      {showPdfButton && (
        <div className="flex justify-end">
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
      )}

      {/* Company Header Card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            {entity.logo_url && (
              <div className="flex-shrink-0 mx-auto sm:mx-0">
                <img 
                  src={entity.logo_url} 
                  alt={entity.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-xl border-4 border-background bg-background shadow-lg"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold">{entity.name || entity.domain}</h1>
                  {entity.linkedin_tagline && (
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">{entity.linkedin_tagline}</p>
                  )}
                </div>
                {glassdoor?.overall_rating && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 cursor-default">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{glassdoor.overall_rating}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Avaliação no Glassdoor</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                {entity.industry && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {entity.industry?.split(',')[0]?.trim()}
                  </Badge>
                )}
                {(entity.headquarters || entity.address) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {entity.headquarters || entity.address}
                  </Badge>
                )}
                {entity.phone && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {entity.phone}
                  </Badge>
                )}
                {entity.size && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {entity.size}
                  </Badge>
                )}
                {entity.year_founded && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fundada em {entity.year_founded}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
                {isValidUrl(entity.website) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={entity.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {isValidUrl(entity.linkedin_url) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={entity.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {isValidUrl(entity.instagram_url) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={entity.instagram_url} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {isValidUrl(entity.youtube_url) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={entity.youtube_url} target="_blank" rel="noopener noreferrer">
                      <Youtube className="h-4 w-4 mr-2" />
                      YouTube
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
          <TabsTrigger value="redes" className="text-xs sm:text-sm py-2">Redes Sociais</TabsTrigger>
          <TabsTrigger value="glassdoor" className="text-xs sm:text-sm py-2">Glassdoor</TabsTrigger>
          <TabsTrigger value="mercado" className="text-xs sm:text-sm py-2">Mercado</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <OverviewTab entity={entity} leadership={leadership} specialties={specialties} />
        </TabsContent>

        {/* REDES SOCIAIS TAB */}
        <TabsContent value="redes" className="mt-6 space-y-6">
          <RedesSociaisTab entity={entity} socialPosts={socialPosts} />
        </TabsContent>

        {/* GLASSDOOR TAB */}
        <TabsContent value="glassdoor" className="mt-6 space-y-6">
          <GlassdoorTab glassdoor={glassdoor} />
        </TabsContent>

        {/* MERCADO TAB */}
        <TabsContent value="mercado" className="mt-6 space-y-6">
          <MercadoTab 
            marketResearch={marketResearch} 
            marketNews={marketNews} 
            similarCompanies={uniqueSimilarCompanies}
            entityId={entityId}
            entityType={entityType}
            domain={domain}
            onRefresh={onRefresh}
            isUpdatingNews={isUpdatingNews}
            updateNews={updateNews}
            entity={entity}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}