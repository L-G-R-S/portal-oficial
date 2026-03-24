import { useParams } from "react-router-dom";
import { SharedEntityDetail } from "@/components/entity/SharedEntityDetail";
import { ROUTES } from "@/lib/constants";

export default function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <SharedEntityDetail 
      id={id}
      entityType="prospect"
      backRoute={ROUTES.PROSPECTS}
      notFoundText="Prospect não encontrado."
    />
  );
}