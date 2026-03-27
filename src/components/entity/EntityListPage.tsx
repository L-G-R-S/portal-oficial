import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEntities } from "@/hooks/useEntities";
import { useAnalysisContext } from "@/contexts/AnalysisContext";
import { Search, Plus, Loader2 } from "lucide-react";
import { UnifiedEntityCard } from "@/components/entity/UnifiedEntityCard";
import { AnalysisProgressBanner } from "@/components/competitor/AnalysisProgressBanner";
import { ROUTES } from "@/lib/constants";

type EntityType = "competitor" | "prospect" | "client";
type TipoEmpresaFiltro = "todos" | "QA" | "SAP";

interface EntityListPageProps {
  entityType: EntityType;
}

const entityConfig = {
  competitor: {
    title: "Lista de Concorrentes",
    singular: "concorrente",
    plural: "concorrentes",
    emptyText: "Nenhum concorrente cadastrado ainda.",
    searchPlaceholder: "Buscar por nome, domínio ou setor...",
    newAnalysisRoute: ROUTES.ANALISE_INTELIGENTE,
    newAnalysisLabel: "Nova Análise",
  },
  prospect: {
    title: "Lista de Prospects",
    singular: "prospect",
    plural: "prospects",
    emptyText: "Nenhum prospect cadastrado ainda.",
    searchPlaceholder: "Buscar por nome, domínio ou setor...",
    newAnalysisRoute: ROUTES.ANALISE_PROSPECT,
    newAnalysisLabel: "Nova Análise",
  },
  client: {
    title: "Lista de Clientes",
    singular: "cliente",
    plural: "clientes",
    emptyText: "Nenhum cliente cadastrado ainda.",
    searchPlaceholder: "Buscar por nome, domínio ou setor...",
    newAnalysisRoute: ROUTES.ANALISE_CLIENTE,
    newAnalysisLabel: "Nova Análise",
  },
};

export default function EntityListPage({ entityType }: EntityListPageProps) {
  const navigate = useNavigate();
  const { entities, isLoading, deleteEntity } = useEntities(entityType);
  const { startAnalysis, isAnalyzing } = useAnalysisContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<TipoEmpresaFiltro>("todos");

  const config = entityConfig[entityType];

  const filteredEntities = entities.filter((entity) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      entity.name?.toLowerCase().includes(searchLower) ||
      entity.domain.toLowerCase().includes(searchLower) ||
      entity.sector?.toLowerCase().includes(searchLower);
    const matchesTipo =
      filtroTipo === "todos" || (entity as any).tipo_empresa === filtroTipo;
    return matchesSearch && matchesTipo;
  });

  const filterButtons: { label: string; value: TipoEmpresaFiltro }[] = [
    { label: "Todos", value: "todos" },
    { label: "QA", value: "QA" },
    { label: "SAP", value: "SAP" },
  ];

  return (
    <div className="space-y-6">
      <AnalysisProgressBanner entityType={entityType} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{config.title}</h1>
          <p className="text-sm text-muted-foreground">
            {entities.length > 0
              ? `${entities.length} ${config.singular}(s) analisado(s)`
              : config.emptyText}
          </p>
        </div>
        <Button
          onClick={() => navigate(config.newAnalysisRoute)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          {config.newAnalysisLabel}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={config.searchPlaceholder}
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {filterButtons.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFiltroTipo(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  filtroTipo === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Carregando {config.plural}...</p>
          </div>
        </div>
      ) : filteredEntities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm || filtroTipo !== "todos"
                ? "Nenhum resultado encontrado com esse critério de busca."
                : config.emptyText}
            </p>
            {!searchTerm && filtroTipo === "todos" && (
              <Button onClick={() => navigate(config.newAnalysisRoute)}>
                Fazer primeira análise
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <UnifiedEntityCard
              key={entity.id}
              entity={entity}
              entityType={entityType}
              isUpdating={isAnalyzing(entity.domain)}
              onUpdate={(domain) => startAnalysis(domain, entityType)}
              onDelete={() => deleteEntity(entity.id, entity.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
