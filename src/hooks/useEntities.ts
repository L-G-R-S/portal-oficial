import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedEntity } from "@/components/entity/UnifiedEntityCard";

export type EntityType = "competitor" | "prospect" | "client";

interface EntityConfig {
  table: "companies";
  glassdoorTable: "glassdoor_summary";
  glassdoorForeignKey: "company_id";
  labels: {
    singular: string;
    plural: string;
  };
}

const entityConfigs: Record<EntityType, EntityConfig> = {
  competitor: {
    table: "companies",
    glassdoorTable: "glassdoor_summary",
    glassdoorForeignKey: "company_id",
    labels: { singular: "Concorrente", plural: "concorrentes" },
  },
  prospect: {
    table: "companies",
    glassdoorTable: "glassdoor_summary",
    glassdoorForeignKey: "company_id",
    labels: { singular: "Prospect", plural: "prospects" },
  },
  client: {
    table: "companies",
    glassdoorTable: "glassdoor_summary",
    glassdoorForeignKey: "company_id",
    labels: { singular: "Cliente", plural: "clientes" },
  },
};

export function useEntities(entityType: EntityType) {
  const [entities, setEntities] = useState<UnifiedEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const config = entityConfigs[entityType];

  const loadEntities = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from(config.table)
        .select(`
          id, domain, name, sector, industry, employee_count, headquarters, address,
          year_founded, website, linkedin_url, logo_url, updated_at, created_at, entity_type, tipo_empresa
        `)
        .eq('entity_type', entityType)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      const entityIds = (data || []).map(e => e.id);
      
      // Fetch glassdoor data based on entity type
      let glassdoorMap = new Map<string, number | null>();
      
      if (entityIds.length > 0) {
        const { data: gd } = await supabase
          .from("glassdoor_summary")
          .select("company_id, overall_rating")
          .in("company_id", entityIds);
        glassdoorMap = new Map((gd || []).map(g => [g.company_id!, g.overall_rating]));
      }
      
      const mappedData: UnifiedEntity[] = (data || []).map(entity => ({
        ...entity,
        hq_location: entity.headquarters || entity.address,
        location: entity.headquarters || entity.address,
        founded_year: entity.year_founded,
        site: entity.website,
        employees: entity.employee_count,
        address: entity.address,
        glassdoor_rating: glassdoorMap.get(entity.id) || null,
      }));
      
      setEntities(mappedData);
    } catch (error) {
      console.error(`Erro ao carregar ${config.labels.plural}:`, error);
      toast({
        title: "Erro ao carregar dados",
        description: `Não foi possível carregar a lista de ${config.labels.plural}.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [entityType, config, toast]);

  const deleteEntity = useCallback(async (id: string, name: string | null) => {
    try {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: `${config.labels.singular} removido`,
        description: `${name || config.labels.singular} foi removido da lista.`,
      });

      await loadEntities();
    } catch (error) {
      console.error("Erro ao deletar:", error);
      toast({
        title: "Erro ao remover",
        description: `Não foi possível remover o ${config.labels.singular.toLowerCase()}.`,
        variant: "destructive",
      });
    }
  }, [config, toast, loadEntities]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  return {
    entities,
    isLoading,
    loadEntities,
    deleteEntity,
  };
}
