import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, ExternalLink } from "lucide-react";

interface Leader {
  name?: string | null;
  position?: string | null;
  linkedin_url?: string | null;
  decision_level?: string | null;
}

interface LeadershipListProps {
  leadership: Leader[];
  maxItems?: number;
}

export function LeadershipList({ leadership, maxItems = 6 }: LeadershipListProps) {
  if (!leadership || leadership.length === 0) return null;

  const displayLeaders = leadership.slice(0, maxItems).filter(leader => leader.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" />
          Pessoas Chaves
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayLeaders.map((leader, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{leader.name}</p>
                {leader.position && (
                  <p className="text-sm text-muted-foreground truncate">{leader.position}</p>
                )}
                {leader.decision_level && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {leader.decision_level}
                  </span>
                )}
              </div>
              {leader.linkedin_url && (
                <Button variant="ghost" size="icon" asChild className="shrink-0 ml-2">
                  <a href={leader.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
