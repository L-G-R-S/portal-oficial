import { useParams } from "react-router-dom";
import { SharedEntityDetail } from "@/components/entity/SharedEntityDetail";
import { ROUTES } from "@/lib/constants";

export default function CompetitorDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <SharedEntityDetail 
      id={id}
      entityType="competitor"
      backRoute={ROUTES.COMPETITORS}
      notFoundText="Concorrente não encontrado."
    />
  );
}
