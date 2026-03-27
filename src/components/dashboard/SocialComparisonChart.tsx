import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Linkedin, Instagram, Youtube } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { getEntityColor, ENTITY_COLORS } from '@/lib/colors';

interface EntityData {
  id: string;
  name: string | null;
  linkedin_followers: number | null;
  instagram_followers: number | null;
  youtube_subscribers: number | null;
  type: 'primary' | 'competitor' | 'prospect' | 'client';
}

interface SocialComparisonChartProps {
  primaryCompany: EntityData | null;
  competitors: EntityData[];
  prospects: EntityData[];
  clients: EntityData[];
  context?: 'all' | 'competitor' | 'prospect' | 'client';
}

function SocialChart({ 
  data, 
  primaryId 
}: { 
  data: { name: string; value: number; type: string; id: string }[]; 
  primaryId: string | null;
}) {
  const sortedData = [...data]
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (sortedData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        Sem dados disponíveis
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={sortedData} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" tickFormatter={(v) => formatNumber(v)} fontSize={11} />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={100} 
          fontSize={11}
          tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
        />
        <Tooltip 
          formatter={(value: number) => [formatNumber(value), 'Seguidores']}
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {sortedData.map((entry) => (
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

function SocialChartsGrid({
  data,
  primaryId
}: {
  data: { id: string; name: string; linkedin: number; instagram: number; youtube: number; type: string }[];
  primaryId: string | null;
}) {
  const linkedinData = data.map(d => ({ id: d.id, name: d.name, value: d.linkedin, type: d.type }));
  const instagramData = data.map(d => ({ id: d.id, name: d.name, value: d.instagram, type: d.type }));
  const youtubeData = data.map(d => ({ id: d.id, name: d.name, value: d.youtube, type: d.type }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <Linkedin className="h-4 w-4 text-[hsl(210,100%,50%)]" />
          <span className="text-sm font-medium">LinkedIn</span>
        </div>
        <SocialChart data={linkedinData} primaryId={primaryId} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <Instagram className="h-4 w-4 text-[hsl(340,80%,55%)]" />
          <span className="text-sm font-medium">Instagram</span>
        </div>
        <SocialChart data={instagramData} primaryId={primaryId} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <Youtube className="h-4 w-4 text-[hsl(0,100%,50%)]" />
          <span className="text-sm font-medium">YouTube</span>
        </div>
        <SocialChart data={youtubeData} primaryId={primaryId} />
      </div>
    </div>
  );
}

export function SocialComparisonChart({ 
  primaryCompany, 
  competitors, 
  prospects, 
  clients,
  context = 'all'
}: SocialComparisonChartProps) {
  const buildChartData = (entities: EntityData[]) => {
    const allEntities = [
      ...(primaryCompany ? [primaryCompany] : []),
      ...entities
    ];

    return allEntities.map(e => ({
      id: e.id,
      name: e.name || e.id.slice(0, 8),
      linkedin: e.linkedin_followers || 0,
      instagram: e.instagram_followers || 0,
      youtube: e.youtube_subscribers || 0,
      type: e.type
    }));
  };

  const competitorData = buildChartData(competitors);
  const prospectData = buildChartData(prospects);
  const clientData = buildChartData(clients);
  const allData = buildChartData([...competitors, ...prospects, ...clients]);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Comparativo de Redes Sociais
        </CardTitle>
      </CardHeader>
      <CardContent>
        {context === 'all' ? (
          <Tabs defaultValue="competitors" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 h-auto gap-1">
              <TabsTrigger value="competitors" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">Concorrentes ({competitors.length})</TabsTrigger>
              <TabsTrigger value="prospects" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">Prospects ({prospects.length})</TabsTrigger>
              <TabsTrigger value="clients" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">Clientes ({clients.length})</TabsTrigger>
              <TabsTrigger value="all" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">Todos</TabsTrigger>
            </TabsList>

            <TabsContent value="competitors">
              <SocialChartsGrid data={competitorData} primaryId={primaryCompany?.id || null} />
            </TabsContent>

            <TabsContent value="prospects">
              <SocialChartsGrid data={prospectData} primaryId={primaryCompany?.id || null} />
            </TabsContent>

            <TabsContent value="clients">
              <SocialChartsGrid data={clientData} primaryId={primaryCompany?.id || null} />
            </TabsContent>

            <TabsContent value="all">
              <SocialChartsGrid data={allData} primaryId={primaryCompany?.id || null} />
            </TabsContent>
          </Tabs>
        ) : (
          <SocialChartsGrid 
            data={context === 'competitor' ? competitorData : context === 'prospect' ? prospectData : clientData} 
            primaryId={primaryCompany?.id || null} 
          />
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
          {(context === 'all' || context === 'competitor') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.primary }} />
              <span className="text-xs text-muted-foreground">Sua empresa</span>
            </div>
          )}
          {(context === 'all' || context === 'competitor') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.competitor }} />
              <span className="text-xs text-muted-foreground">Concorrentes</span>
            </div>
          )}
          {(context === 'all' || context === 'prospect') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.prospect }} />
              <span className="text-xs text-muted-foreground">Prospects</span>
            </div>
          )}
          {(context === 'all' || context === 'client') && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ENTITY_COLORS.client }} />
              <span className="text-xs text-muted-foreground">Clientes</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
