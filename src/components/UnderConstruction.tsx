import { Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function UnderConstruction() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Construction className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Em Construção</h2>
          <p className="text-muted-foreground">Esta página está sendo desenvolvida.</p>
        </CardContent>
      </Card>
    </div>
  );
}
