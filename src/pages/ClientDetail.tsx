import { useParams } from "react-router-dom";
import { SharedEntityDetail } from "@/components/entity/SharedEntityDetail";
import { ROUTES } from "@/lib/constants";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <SharedEntityDetail 
      id={id}
      entityType="client"
      backRoute={ROUTES.CLIENTS}
      notFoundText="Cliente não encontrado."
    />
  );
}