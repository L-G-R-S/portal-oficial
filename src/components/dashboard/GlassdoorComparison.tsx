import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Star } from 'lucide-react';
import { getEntityColor, ENTITY_COLORS } from '@/lib/colors';

interface EntityData {
  id: string;
  name: string | null;
  glassdoor_rating?: number | null;
  type: 'primary' | 'competitor' | 'prospect' | 'client';
}

interface GlassdoorComparisonProps {
  primaryCompany: EntityData | null;
  competitors: EntityData[];
  prospects: EntityData[];
  clients: EntityData[];
}

function GlassdoorChart({ 
  data, 
  primaryId 
}: { 
  data: { id: string; name: string; rating: number; type: string }[];
  primaryId: string | null;
}) {
  const chartData = data
    .filter(e => e.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  if (chartData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        Nenhum dado de Glassdoor disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" domain={[0, 5]} tickFormatter={(v) => v.toFixed(1)} fontSize={11} />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={100} 
          fontSize={11}
          tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
        />
        <Tooltip 
          formatter={(value: number) => [value.toFixed(1), 'Rating']}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="rating" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell 
              key={entry.id} 
              fill={getEntityColor(entry.type, entry.id === primaryId)} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function StatsPanel({ 
  data, 
  primaryCompany,
  label 
}: { 
  data: { rating: number }[];
  primaryCompany: EntityData | null;
  label: string;
}) {
  const validData = data.filter(d => d.rating > 0);
  const avgRating = validData.length > 0 
    ? validData.reduce((acc, e) => acc + e.rating, 0) / validData.length 
    : 0;

  return (
    <div className="space-y-4">
      <div className="text-center p-4 rounded-lg bg-muted">
        <p className="text-3xl font-bold text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : '-'}</p>
        <p className="text-xs text-muted-foreground mt-1">Média {label}</p>
        <div className="flex justify-center mt-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star 
              key={star} 
              className={`h-4 w-4 ${star <= Math.round(avgRating) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} 
            />
          ))}
        </div>
      </div>
      {primaryCompany?.glassdoor_rating && primaryCompany.glassdoor_rating > 0 && (
        <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-2xl font-bold text-primary">{primaryCompany.glassdoor_rating.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">Sua empresa</p>
        </div>
      )}
    </div>
  );
}

export function GlassdoorComparison({ 
  primaryCompany, 
  competitors, 
  prospects, 
  clients 
}: GlassdoorComparisonProps) {
  const buildData = (entities: EntityData[]) => {
    const data = [
      ...(primaryCompany && primaryCompany.glassdoor_rating ? [{
        id: primaryCompany.id,
        name: primaryCompany.name || 'Sua empresa',
        rating: primaryCompany.glassdoor_rating,
        type: 'primary'
      }] : []),
      ...entities
        .filter(e => e.glassdoor_rating && e.glassdoor_rating > 0)
        .map(e => ({
          id: e.id,
          name: e.name || 'Empresa',
          rating: e.glassdoor_rating || 0,
          type: e.type
        }))
    ];
    return data;
  };

  const competitorData = buildData(competitors);
  const prospectData = buildData(prospects);
  const clientData = buildData(clients);
  
  const allEntities = [...competitors, ...prospects, ...clients];
  const allData = buildData(allEntities);

  const hasAnyData = allData.length > 0;

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Análise Glassdoor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Nenhum dado de Glassdoor disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Análise Glassdoor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="competitors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 h-auto gap-1">
            <TabsTrigger value="competitors" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Concorrentes {competitors.filter(c => c.glassdoor_rating).length > 0 && `(${competitors.filter(c => c.glassdoor_rating).length})`}
            </TabsTrigger>
            <TabsTrigger value="prospects" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Prospects {prospects.filter(p => p.glassdoor_rating).length > 0 && `(${prospects.filter(p => p.glassdoor_rating).length})`}
            </TabsTrigger>
            <TabsTrigger value="clients" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Clientes {clients.filter(c => c.glassdoor_rating).length > 0 && `(${clients.filter(c => c.glassdoor_rating).length})`}
            </TabsTrigger>
            <TabsTrigger value="all" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">Geral</TabsTrigger>
          </TabsList>

          <TabsContent value="competitors">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatsPanel data={competitorData} primaryCompany={primaryCompany} label="concorrentes" />
              <div className="lg:col-span-3 min-w-0">
                <GlassdoorChart data={competitorData} primaryId={primaryCompany?.id || null} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prospects">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatsPanel data={prospectData} primaryCompany={primaryCompany} label="prospects" />
              <div className="lg:col-span-3 min-w-0">
                <GlassdoorChart data={prospectData} primaryId={primaryCompany?.id || null} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clients">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatsPanel data={clientData} primaryCompany={primaryCompany} label="clientes" />
              <div className="lg:col-span-3 min-w-0">
                <GlassdoorChart data={clientData} primaryId={primaryCompany?.id || null} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <StatsPanel data={allData} primaryCompany={primaryCompany} label="geral" />
              <div className="lg:col-span-3 min-w-0">
                <GlassdoorChart data={allData} primaryId={primaryCompany?.id || null} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Sua empresa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.competitor }} />
            <span className="text-xs text-muted-foreground">Concorrentes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.prospect }} />
            <span className="text-xs text-muted-foreground">Prospects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.client }} />
            <span className="text-xs text-muted-foreground">Clientes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}