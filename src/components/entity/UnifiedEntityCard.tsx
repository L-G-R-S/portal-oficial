import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateBR } from "@/lib/formatters";
import { sanitizeUrl } from "@/utils/helpers";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ExternalLink,
  Globe,
  Users,
  MapPin,
  Calendar,
  Star,
  Trash2,
  RefreshCw,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export type EntityType = "competitor" | "prospect" | "client";

export interface UnifiedEntity {
  id: string;
  domain: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  employee_count: number | null;
  employees?: number | null;
  headquarters: string | null;
  hq_location?: string | null;
  location?: string | null;
  year_founded: number | null;
  founded_year?: number | null;
  website: string | null;
  site?: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  updated_at: string | null;
  created_at: string | null;
  glassdoor_rating: number | null;
}

interface UnifiedEntityCardProps {
  entity: UnifiedEntity;
  entityType: EntityType;
  isUpdating?: boolean;
  onUpdate?: (domain: string) => void;
  onDelete?: (id: string, name: string | null) => void;
}

const entityLabels: Record<EntityType, { singular: string; detailPath: string }> = {
  competitor: { singular: "Concorrente", detailPath: "/competitor" },
  prospect: { singular: "Prospect", detailPath: "/prospect" },
  client: { singular: "Cliente", detailPath: "/client" },
};

export function UnifiedEntityCard({ 
  entity, 
  entityType,
  isUpdating = false,
  onUpdate,
  onDelete 
}: UnifiedEntityCardProps) {
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const labels = entityLabels[entityType];

  const handleViewDetails = () => {
    navigate(`${labels.detailPath}/${entity.id}`);
  };

  const getFirstSector = (sector: string | null) => {
    if (!sector) return null;
    return sector.split(',')[0]?.trim();
  };

  const getLocation = () => {
    return entity.hq_location || entity.headquarters || entity.location || null;
  };

  const getEmployees = () => {
    return entity.employee_count || entity.employees || null;
  };

  const getSite = () => {
    return entity.site || entity.website || null;
  };

  const getFoundedYear = () => {
    return entity.founded_year || entity.year_founded || null;
  };

  const site = getSite();

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleViewDetails}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          {entity.logo_url && (
            <img 
              src={entity.logo_url} 
              alt={entity.name || entity.domain}
              className="w-12 h-12 object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">
              {entity.name || entity.domain}
            </CardTitle>
            {(entity.sector || entity.industry) && (
              <Badge variant="secondary" className="text-xs">
                {getFirstSector(entity.sector || entity.industry)}
              </Badge>
            )}
          </div>
          {entity.glassdoor_rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{entity.glassdoor_rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4 flex-shrink-0" />
            {site ? (
              <a 
                href={site.startsWith('http') ? site : `https://${site}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {sanitizeUrl(site)}
              </a>
            ) : (
              <span className="text-muted-foreground/50">Site não informado</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span>{getLocation() || "Localização não informada"}</span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>
              {getEmployees()
                ? `${getEmployees()!.toLocaleString('pt-BR')} funcionários`
                : "Funcionários não informado"
              }
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {getFoundedYear() 
                ? `Fundada em ${getFoundedYear()}`
                : "Ano de fundação não informado"
              }
            </span>
          </div>
        </div>

        <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Atualizado {formatDateBR(entity.updated_at)}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {onUpdate && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isUpdating}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(entity.domain);
              }}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Atualizar
                </>
              )}
            </Button>
          )}
          
          {site && (
            <Button
              variant="outline"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a 
                href={site.startsWith('http') ? site : `https://${site}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          )}

          {/* Botão de excluir - Apenas para Super Admin */}
          {onDelete && isSuperAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja remover {entity.name || entity.domain} da lista?
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(entity.id, entity.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
