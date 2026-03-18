import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ThumbsUp, UserCheck, TrendingUp, Heart, Briefcase, Scale, Users } from "lucide-react";

interface GlassdoorData {
  overall_rating?: number | null;
  recommend_to_friend?: number | null;
  ceo_rating?: number | null;
  compensation_benefits_rating?: number | null;
  culture_values_rating?: number | null;
  career_opportunities_rating?: number | null;
  work_life_balance_rating?: number | null;
  diversity_inclusion_rating?: number | null;
  pros_example?: string | null;
  cons_example?: string | null;
  advice_example?: string | null;
}

interface GlassdoorCardProps {
  glassdoor: GlassdoorData | null;
}

function RatingBar({ label, rating, icon: Icon }: { label: string; rating: number | null | undefined; icon: React.ElementType }) {
  if (!rating) return null;
  
  const percentage = (rating / 5) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function GlassdoorCard({ glassdoor }: GlassdoorCardProps) {
  if (!glassdoor?.overall_rating) return null;

  const recommendPercent = glassdoor.recommend_to_friend != null && glassdoor.recommend_to_friend >= 0
    ? Math.round(glassdoor.recommend_to_friend * 100)
    : null;
  
  const ceoPercent = glassdoor.ceo_rating != null && glassdoor.ceo_rating >= 0
    ? Math.round(glassdoor.ceo_rating * 100)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Avaliação Glassdoor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Rating */}
        <div className="flex items-center justify-center gap-4 p-4 bg-primary/5 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              <span className="text-4xl font-bold">{glassdoor.overall_rating}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">de 5.0</p>
          </div>
          
          {(recommendPercent || ceoPercent) && (
            <div className="border-l pl-4 space-y-2">
              {recommendPercent && (
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{recommendPercent}%</span>
                  <span className="text-muted-foreground">recomendam</span>
                </div>
              )}
              {ceoPercent && (
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{ceoPercent}%</span>
                  <span className="text-muted-foreground">aprovam CEO</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingBar label="Compensação e Benefícios" rating={glassdoor.compensation_benefits_rating} icon={TrendingUp} />
          <RatingBar label="Cultura e Valores" rating={glassdoor.culture_values_rating} icon={Heart} />
          <RatingBar label="Oportunidades de Carreira" rating={glassdoor.career_opportunities_rating} icon={Briefcase} />
          <RatingBar label="Equilíbrio Vida-Trabalho" rating={glassdoor.work_life_balance_rating} icon={Scale} />
          <RatingBar label="Diversidade e Inclusão" rating={glassdoor.diversity_inclusion_rating} icon={Users} />
        </div>

        {/* Reviews Examples */}
        {(glassdoor.pros_example || glassdoor.cons_example) && (
          <div className="space-y-3 pt-4 border-t">
            {glassdoor.pros_example && (
              <div className="p-3 bg-green-500/10 rounded-lg">
                <p className="text-xs font-medium text-green-600 mb-1">Pontos Positivos</p>
                <p className="text-sm text-muted-foreground">{glassdoor.pros_example}</p>
              </div>
            )}
            {glassdoor.cons_example && (
              <div className="p-3 bg-red-500/10 rounded-lg">
                <p className="text-xs font-medium text-red-600 mb-1">Pontos Negativos</p>
                <p className="text-sm text-muted-foreground">{glassdoor.cons_example}</p>
              </div>
            )}
            {glassdoor.advice_example && (
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <p className="text-xs font-medium text-blue-600 mb-1">Conselho à Diretoria</p>
                <p className="text-sm text-muted-foreground">{glassdoor.advice_example}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
