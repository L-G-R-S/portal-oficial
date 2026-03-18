import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { ROUTES } from "@/lib/constants";

export function UserManagementCard() {
  const navigate = useNavigate();
  const { users } = useUserManagement();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gerenciamento de Usuários
        </CardTitle>
        <CardDescription>
          {users.length > 0 
            ? `${users.length} usuário${users.length !== 1 ? 's' : ''} cadastrado${users.length !== 1 ? 's' : ''} no sistema`
            : "Visualize e gerencie os usuários cadastrados"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => navigate(ROUTES.USER_MANAGEMENT)} className="w-full">
          <Users className="h-4 w-4 mr-2" />
          Gerenciar Usuários
        </Button>
      </CardContent>
    </Card>
  );
}
