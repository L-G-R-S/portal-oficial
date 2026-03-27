import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Newspaper,
  MessageSquare,
  Lightbulb,
  Hash,
  Megaphone,
  Link,
  BarChart3,
  Building2,
  ExternalLink,
  FileDown,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { isValidUrl } from "@/utils/helpers";

interface MercadoTabProps {
  marketResearch: any;
  marketNews: any[];
  similarCompanies: any[];
  entityId?: string;
  entityType?: 'competitor' | 'prospect' | 'client' | 'primary';
  domain?: string;
  onRefresh?: () => void;
  isUpdatingNews: boolean;
  updateNews: (entityId: string, domain: string, entityType: 'competitor' | 'prospect' | 'client' | 'primary') => Promise<boolean>;
  entity?: any;
}

export function MercadoTab({ 
  marketResearch, 
  marketNews, 
  similarCompanies,
  entityId,
  entityType,
  domain,
  onRefresh,
  isUpdatingNews,
  updateNews,
}: MercadoTabProps) {
  const swotAnalysis = marketResearch?.swot_analysis;
  const strategicAnalysis = marketResearch?.strategic_analysis;
  const institutionalDiscourse = marketResearch?.institutional_discourse;
  const institutionalCuriosities = marketResearch?.institutional_curiosities;
  const recurringTopics = marketResearch?.recurring_topics;
  const publicActions = marketResearch?.public_actions;
  const digitalPresence = marketResearch?.digital_presence;

  const handleUpdateNews = async () => {
    if (!entityId || !domain || !entityType) return;
    const success = await updateNews(entityId, domain, entityType);
    if (success && onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      {/* Institutional Discourse */}
      {institutionalDiscourse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Discurso Institucional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {institutionalDiscourse}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Institutional Curiosities */}
      {institutionalCuriosities && Array.isArray(institutionalCuriosities) && institutionalCuriosities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Curiosidades Institucionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {institutionalCuriosities.map((curiosity: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  {curiosity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recurring Topics */}
      {recurringTopics && Array.isArray(recurringTopics) && recurringTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Tópicos Recorrentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recurringTopics.map((topic: string, idx: number) => (
                <Badge key={idx} variant="secondary">{topic}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Digital Presence */}
      {digitalPresence && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Presença Digital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isValidUrl(digitalPresence.site_institucional) && (
                <a 
                  href={digitalPresence.site_institucional} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm">Site Institucional</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {isValidUrl(digitalPresence.blog) && (
                <a 
                  href={digitalPresence.blog} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Newspaper className="h-4 w-4 text-primary" />
                  <span className="text-sm">Blog</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              )}
              {digitalPresence.eventos && Array.isArray(digitalPresence.eventos) && digitalPresence.eventos.length > 0 && (
                <div className="p-3 border rounded-lg col-span-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Eventos</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {digitalPresence.eventos.map((evento: string, idx: number) => (
                      <li key={idx}>• {evento}</li>
                    ))}
                  </ul>
                </div>
              )}
              {digitalPresence.materiais && Array.isArray(digitalPresence.materiais) && digitalPresence.materiais.length > 0 && (
                <div className="p-3 border rounded-lg col-span-full">
                  <div className="flex items-center gap-2 mb-2">
                    <FileDown className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Materiais</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {digitalPresence.materiais.map((material: string, idx: number) => (
                      <li key={idx}>• {material}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SWOT Analysis */}
      {swotAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Análise SWOT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {swotAnalysis.pontos_fortes?.length > 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-green-600 flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4" />
                    Pontos Fortes
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swotAnalysis.pontos_fortes.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {swotAnalysis.pontos_fracos?.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-3">
                    <XCircle className="h-4 w-4" />
                    Pontos Fracos
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swotAnalysis.pontos_fracos.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {swotAnalysis.oportunidades?.length > 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-600 flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4" />
                    Oportunidades
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swotAnalysis.oportunidades.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {swotAnalysis.ameacas?.length > 0 && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <h4 className="font-semibold text-orange-600 flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4" />
                    Ameaças
                  </h4>
                  <ul className="text-sm space-y-1">
                    {swotAnalysis.ameacas.map((item: string, idx: number) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Analysis */}
      {strategicAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Análise Estratégica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {strategicAnalysis.visao_geral && (
              <div>
                <h4 className="font-semibold mb-2">Visão Geral</h4>
                <p className="text-sm text-muted-foreground">{strategicAnalysis.visao_geral}</p>
              </div>
            )}
            {strategicAnalysis.posicionamento && (
              <div>
                <h4 className="font-semibold mb-2">Posicionamento</h4>
                <p className="text-sm text-muted-foreground">{strategicAnalysis.posicionamento}</p>
              </div>
            )}
            {strategicAnalysis.dinamica_competitiva && (
              <div>
                <h4 className="font-semibold mb-2">Dinâmica Competitiva</h4>
                <p className="text-sm text-muted-foreground">{strategicAnalysis.dinamica_competitiva}</p>
              </div>
            )}
            {strategicAnalysis.insights_estrategicos && (
              <div>
                <h4 className="font-semibold mb-2">Insights Estratégicos</h4>
                <p className="text-sm text-muted-foreground">{strategicAnalysis.insights_estrategicos}</p>
              </div>
            )}
            {(strategicAnalysis.visao_executiva_resumida || strategicAnalysis.resumo_executivo) && (
              <div>
                <h4 className="font-semibold mb-2">Resumo Executivo</h4>
                <p className="text-sm text-muted-foreground">{strategicAnalysis.visao_executiva_resumida || strategicAnalysis.resumo_executivo}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market News */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            Notícias de Mercado
          </CardTitle>
          {entityId && domain && entityType && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUpdateNews}
              disabled={isUpdatingNews}
            >
              {isUpdatingNews ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isUpdatingNews ? "Atualizando..." : "Atualizar Notícias"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Public Actions Subtopic */}
          {publicActions && Array.isArray(publicActions) && publicActions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="h-4 w-4 text-primary" />
                <h4 className="font-semibold text-sm">Ações Públicas</h4>
              </div>
              <div className="space-y-3">
                {publicActions.slice(0, 5).map((action: any, idx: number) => (
                  <div key={`action-${idx}`} className="p-3 border rounded-lg hover:bg-accent transition-colors bg-primary/5">
                    <h5 className="font-medium text-sm">{action.titulo}</h5>
                    {action.resumo && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {action.resumo}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {action.data && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(action.data).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {action.tipo && (
                        <Badge variant="secondary" className="text-xs">{action.tipo}</Badge>
                      )}
                      {isValidUrl(action.url) && (
                        <a href={action.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          Ver mais
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market News - filter out duplicates from public actions */}
          {(() => {
            const publicActionUrls = new Set(
              (publicActions || [])
                .filter((a: any) => a.url)
                .map((a: any) => a.url.toLowerCase().trim())
            );
            
            const filteredNews = marketNews.filter((news: any) => {
              if (!news.url) return true;
              return !publicActionUrls.has(news.url.toLowerCase().trim());
            });

            const hasPublicActions = publicActions && Array.isArray(publicActions) && publicActions.length > 0;
            const allNewsAreDuplicates = marketNews.length > 0 && filteredNews.length === 0;

            return (
              <>
                {hasPublicActions && (marketNews.length > 0 || filteredNews.length > 0) && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Newspaper className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">Notícias</h4>
                    </div>
                  </div>
                )}

                {filteredNews.length > 0 && (
                  <div className="space-y-3">
                    {filteredNews.slice(0, 10).map((news: any, idx: number) => (
                      <div key={`news-${idx}`} className="p-3 border rounded-lg hover:bg-accent transition-colors">
                        <h5 className="font-medium text-sm">{news.titulo}</h5>
                        {news.resumo && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{news.resumo}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {news.data && (
                            <span className="text-xs text-muted-foreground">{new Date(news.data).toLocaleDateString('pt-BR')}</span>
                          )}
                          {news.tipo && (
                            <Badge variant="outline" className="text-xs">{news.tipo}</Badge>
                          )}
                          {isValidUrl(news.url) && (
                            <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                              Ver mais
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {hasPublicActions && allNewsAreDuplicates && (
                  <p className="text-muted-foreground text-center py-2 text-sm">
                    Todas as notícias estão consolidadas em Ações Públicas acima.
                  </p>
                )}

                {!hasPublicActions && marketNews.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma notícia disponível. Clique em "Atualizar Notícias" para buscar.
                  </p>
                )}
              </>
            );
          })()}
        </CardContent>
      </Card>

      {/* References Section */}
      {marketResearch?.source_references && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Referências e Fontes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {marketResearch.source_references.split(',').map((url: string, idx: number) => {
                const cleanUrl = url.trim();
                if (!isValidUrl(cleanUrl)) return null;
                
                return (
                  <a 
                    key={`ref-${idx}`} 
                    href={cleanUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                      {cleanUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </span>
                    <ExternalLink className="h-3 w-3 ml-auto opacity-50 group-hover:opacity-100" />
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Similar Companies */}
      {similarCompanies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Empresas Similares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarCompanies.slice(0, 10).map((company: any, idx: number) => {
                const hasValidUrl = isValidUrl(company.url);
                const content = (
                  <>
                    {company.logo_url && (
                      <img 
                        src={company.logo_url} 
                        alt={company.name}
                        className="w-12 h-12 object-contain rounded mb-2"
                      />
                    )}
                    <span className="text-xs font-medium line-clamp-2">{company.name}</span>
                    {company.industry && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{company.industry}</span>
                    )}
                  </>
                );

                return hasValidUrl ? (
                  <a 
                    key={idx} 
                    href={company.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-3 border rounded-lg hover:bg-accent transition-colors text-center"
                  >
                    {content}
                  </a>
                ) : (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center p-3 border rounded-lg text-center"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}