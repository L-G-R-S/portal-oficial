import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Newspaper, ExternalLink, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isValidUrl } from '@/utils/helpers';
import { getEntityLabel, ENTITY_COLORS } from '@/lib/colors';

interface NewsItem {
  id: string;
  titulo: string | null;
  url: string | null;
  data: string | null;
  resumo: string | null;
  tipo: string | null;
  fonte: string | null;
  entity_name: string | null;
  entity_logo: string | null;
  entity_type: 'competitor' | 'prospect' | 'client' | 'primary';
}

interface NewsFeedProps {
  news: NewsItem[];
}

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'competitor': 
      return `bg-[${ENTITY_COLORS.competitor}]/10 text-[${ENTITY_COLORS.competitor}] border-[${ENTITY_COLORS.competitor}]/30`;
    case 'prospect': 
      return `bg-[${ENTITY_COLORS.prospect}]/10 text-[${ENTITY_COLORS.prospect}] border-[${ENTITY_COLORS.prospect}]/30`;
    case 'client': 
      return `bg-[${ENTITY_COLORS.client}]/10 text-[${ENTITY_COLORS.client}] border-[${ENTITY_COLORS.client}]/30`;
    default: 
      return '';
  }
};

const getClassificationEmoji = (tipo: string | null) => {
  if (!tipo) return '📰';
  const lower = tipo.toLowerCase();
  if (lower.includes('evento')) return '🎉';
  if (lower.includes('parceria')) return '🤝';
  if (lower.includes('lançamento') || lower.includes('produto')) return '🚀';
  if (lower.includes('prêmio') || lower.includes('reconhecimento')) return '🏆';
  if (lower.includes('expansão') || lower.includes('crescimento') || lower.includes('aquisição')) return '📈';
  return '📝';
};

function NewsItemCard({ item }: { item: NewsItem }) {
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      {/* Entity Logo */}
      <div className="flex-shrink-0">
        {item.entity_logo ? (
          <img 
            src={item.entity_logo} 
            alt={item.entity_name || ''} 
            className="w-10 h-10 rounded-lg object-contain bg-background p-1"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-sm font-medium">{item.entity_name || 'Empresa'}</span>
              <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(item.entity_type)}`}>
                {getEntityLabel(item.entity_type)}
              </Badge>
            </div>
            
            <p className="text-sm text-foreground line-clamp-2">
              {getClassificationEmoji(item.tipo)} {item.titulo || 'Sem título'}
            </p>
            
            {item.data && (
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(item.data), { addSuffix: true, locale: ptBR })}
              </p>
            )}
          </div>

          {/* Link */}
          {item.url && isValidUrl(item.url) && (
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0 p-2 rounded-lg hover:bg-background transition-colors"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Abrir notícia: ${item.titulo}`}
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsList({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        Nenhuma notícia disponível
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item) => (
        <NewsItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export function NewsFeed({ news }: NewsFeedProps) {
  const competitorNews = news.filter(n => n.entity_type === 'competitor');
  const prospectNews = news.filter(n => n.entity_type === 'prospect');
  const clientNews = news.filter(n => n.entity_type === 'client');

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 text-center sm:text-left">
        <CardTitle className="text-lg font-semibold flex items-center justify-center sm:justify-start gap-2 w-full">
          <Newspaper className="h-5 w-5 text-primary" />
          Notícias Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 h-auto gap-1">
            <TabsTrigger value="all" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Todas ({news.length})
            </TabsTrigger>
            <TabsTrigger value="competitors" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Concorrentes ({competitorNews.length})
            </TabsTrigger>
            <TabsTrigger value="prospects" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Prospects ({prospectNews.length})
            </TabsTrigger>
            <TabsTrigger value="clients" className="whitespace-normal h-auto min-h-10 text-[11px] sm:text-sm">
              Clientes ({clientNews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NewsList items={news} />
          </TabsContent>

          <TabsContent value="competitors">
            <NewsList items={competitorNews} />
          </TabsContent>

          <TabsContent value="prospects">
            <NewsList items={prospectNews} />
          </TabsContent>

          <TabsContent value="clients">
            <NewsList items={clientNews} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}