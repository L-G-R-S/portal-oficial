import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <h2 className="mb-2 text-2xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="mb-6 text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
