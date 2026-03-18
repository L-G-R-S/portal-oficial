import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrimaryCompany } from "@/hooks/usePrimaryCompany";
import { Building2, Eye, Linkedin, Instagram, Youtube, Clock } from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PrimaryCompanySettingsReadOnly() {
  const navigate = useNavigate();
  const { primaryCompany, isLoading } = usePrimaryCompany();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresa Principal
          </CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (!primaryCompany) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresa Principal
          </CardTitle>
          <CardDescription>
            Nenhuma empresa principal configurada. Entre em contato com o administrador.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Empresa Principal
        </CardTitle>
        <CardDescription>
          Empresa configurada para análise comparativa (somente visualização)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Info */}
        <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border">
          {primaryCompany.logo_url ? (
            <img
              src={primaryCompany.logo_url}
              alt={primaryCompany.name || "Logo"}
              className="h-16 w-16 rounded-lg object-contain bg-white border"
            />
          ) : (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {primaryCompany.name || primaryCompany.domain}
            </h3>
            {primaryCompany.industry && (
              <p className="text-sm text-muted-foreground">{primaryCompany.industry}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {primaryCompany.domain}
            </p>
          </div>
        </div>

        {/* Social Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <Linkedin className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">LinkedIn</p>
              <p className="font-medium text-sm">
                {primaryCompany.linkedin_followers 
                  ? formatNumber(primaryCompany.linkedin_followers)
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <Instagram className="h-4 w-4 text-pink-600" />
            <div>
              <p className="text-xs text-muted-foreground">Instagram</p>
              <p className="font-medium text-sm">
                {primaryCompany.instagram_followers 
                  ? formatNumber(primaryCompany.instagram_followers)
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <Youtube className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-xs text-muted-foreground">YouTube</p>
              <p className="font-medium text-sm">
                {primaryCompany.youtube_subscribers 
                  ? formatNumber(primaryCompany.youtube_subscribers)
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Last Analysis */}
        {primaryCompany.analyzed_at && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Última análise: {format(new Date(primaryCompany.analyzed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* View Details Button */}
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate(`/primary-company/${primaryCompany.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes Completos
        </Button>
      </CardContent>
    </Card>
  );
}
