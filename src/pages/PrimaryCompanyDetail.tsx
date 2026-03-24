import { useParams } from "react-router-dom";
import { SharedEntityDetail } from "@/components/entity/SharedEntityDetail";
import { ROUTES } from "@/lib/constants";

export default function PrimaryCompanyDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <SharedEntityDetail 
      id={id}
      entityType="primary"
      backRoute={ROUTES.SETTINGS}
      notFoundText="Empresa principal não encontrada."
    />
  );
}
