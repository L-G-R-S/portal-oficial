import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Briefcase,
  Target,
  Award,
  TrendingUp,
  UserCircle,
  Sparkles,
  Linkedin,
  Users,
} from "lucide-react";
import { isValidUrl } from "@/utils/helpers";

interface OverviewTabProps {
  entity: any;
  leadership: any[];
  specialties: string[];
}

export function OverviewTab({ entity, leadership, specialties }: OverviewTabProps) {
  return (
    <>
      {entity.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Sobre a Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {entity.description}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entity.products_services && Array.isArray(entity.products_services) && entity.products_services.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Produtos e Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                {entity.products_services.slice(0, 5).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {entity.differentiators && Array.isArray(entity.differentiators) && entity.differentiators.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Diferenciais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                {entity.differentiators.slice(0, 5).map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {entity.market && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Mercado Alvo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{entity.market}</p>
            </CardContent>
          </Card>
        )}

        {entity.business_model && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Modelo de Negócio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{entity.business_model}</p>
            </CardContent>
          </Card>
        )}

        {entity.clients && Array.isArray(entity.clients) && entity.clients.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Clientes Citados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {entity.clients.slice(0, 10).map((item: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {entity.partners && Array.isArray(entity.partners) && entity.partners.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Parceiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {entity.partners.slice(0, 5).map((item: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec: string, idx: number) => (
                <Badge key={idx} variant="secondary">{spec}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {leadership.length > 0 && (
        <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-primary" />
              Pessoas Chaves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadership.slice(0, 6).map((leader: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                  <h4 className="font-semibold">{leader.name}</h4>
                  {leader.position && (
                    <p className="text-sm text-muted-foreground mt-1">{leader.position}</p>
                  )}
                  {isValidUrl(leader.linkedin_url) && (
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-3" asChild>
                      <a href={leader.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        <Linkedin className="h-3 w-3" />
                        Ver LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}