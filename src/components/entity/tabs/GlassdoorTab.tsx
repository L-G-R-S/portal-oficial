import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, BarChart3, ThumbsUp, MessageCircle } from "lucide-react";

interface GlassdoorTabProps {
  glassdoor: any;
}

export function GlassdoorTab({ glassdoor }: GlassdoorTabProps) {
  if (!glassdoor) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Dados do Glassdoor não disponíveis.</p>
        </CardContent>
      </Card>
    );
  }

  const ratingCategories = [
    { label: "Cultura & Valores", value: glassdoor.culture_values_rating },
    { label: "Diversidade & Inclusão", value: glassdoor.diversity_inclusion_rating },
    { label: "Equilíbrio Vida/Trabalho", value: glassdoor.work_life_balance_rating },
    { label: "Salário & Benefícios", value: glassdoor.compensation_benefits_rating },
    { label: "Oportunidades de Carreira", value: glassdoor.career_opportunities_rating },
  ].filter(r => r.value);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {glassdoor.overall_rating && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avaliação Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold">{glassdoor.overall_rating}</span>
                <span className="text-muted-foreground">/ 5</span>
              </div>
            </CardContent>
          </Card>
        )}

        {glassdoor.recommend_to_friend && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recomendam</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{Math.round((glassdoor.recommend_to_friend || 0) * 100)}%</p>
              <p className="text-xs text-muted-foreground">recomendam a empresa</p>
            </CardContent>
          </Card>
        )}

        {glassdoor.ceo_rating && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Aprovação do CEO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{Math.round((glassdoor.ceo_rating || 0) * 100)}%</p>
              <p className="text-xs text-muted-foreground">aprovam o CEO</p>
            </CardContent>
          </Card>
        )}
      </div>

      {ratingCategories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Avaliações por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratingCategories.map((category, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{category.label}</span>
                    <span className="font-medium">{category.value}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(category.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(glassdoor.pros_example || glassdoor.cons_example) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {glassdoor.pros_example && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  Prós
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{glassdoor.pros_example}</p>
              </CardContent>
            </Card>
          )}
          {glassdoor.cons_example && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                  <MessageCircle className="h-4 w-4" />
                  Contras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{glassdoor.cons_example}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}