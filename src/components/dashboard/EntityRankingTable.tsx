import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Building2, Linkedin, Instagram, Youtube, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { formatNumber } from '@/lib/formatters';
import { getEntityBadgeClasses, getEntityShortLabel, ENTITY_COLORS, SOCIAL_COLORS } from '@/lib/colors';
import { Button } from '@/components/ui/button';

interface EntityData {
  id: string;
  name: string | null;
  logo_url: string | null;
  linkedin_followers: number | null;
  instagram_followers: number | null;
  youtube_subscribers: number | null;
  glassdoor_rating?: number | null;
  type: 'primary' | 'competitor' | 'prospect' | 'client';
}

interface EntityRankingTableProps {
  primaryCompany: EntityData | null;
  competitors: EntityData[];
  prospects: EntityData[];
  clients: EntityData[];
}

type SortKey = 'name' | 'linkedin' | 'instagram' | 'youtube' | 'glassdoor';

const getTypeBadge = (type: string) => {
  if (type === 'primary') {
    return <Badge className="bg-primary text-primary-foreground text-xs">Você</Badge>;
  }
  return <Badge variant="outline" className={`${getEntityBadgeClasses(type)} text-xs`}>{getEntityShortLabel(type)}</Badge>;
};

type FilterType = 'all' | 'competitor' | 'prospect' | 'client';

export function EntityRankingTable({ primaryCompany, competitors, prospects, clients }: EntityRankingTableProps) {
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('linkedin');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const allEntities: EntityData[] = [
    ...(primaryCompany ? [primaryCompany] : []),
    ...competitors,
    ...prospects,
    ...clients
  ];

  const filteredEntities = filterType === 'all' 
    ? allEntities 
    : allEntities.filter(e => e.type === filterType || e.type === 'primary');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const getSortValue = (entity: EntityData, key: SortKey): number | string => {
    switch (key) {
      case 'name': return entity.name || '';
      case 'linkedin': return entity.linkedin_followers || 0;
      case 'instagram': return entity.instagram_followers || 0;
      case 'youtube': return entity.youtube_subscribers || 0;
      case 'glassdoor': return entity.glassdoor_rating || 0;
    }
  };

  const sortedEntities = [...filteredEntities].sort((a, b) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    return sortAsc 
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const handleRowClick = (entity: EntityData) => {
    if (entity.type === 'primary') {
      navigate(`/primary-company/${entity.id}`);
    } else if (entity.type === 'competitor') {
      navigate(ROUTES.COMPETITOR_DETAIL.replace(':id', entity.id));
    } else if (entity.type === 'prospect') {
      navigate(ROUTES.PROSPECT_DETAIL.replace(':id', entity.id));
    } else if (entity.type === 'client') {
      navigate(ROUTES.CLIENT_DETAIL.replace(':id', entity.id));
    }
  };

  const SortableHeader = ({ label, sortKeyName, icon: Icon }: { label: string; sortKeyName: SortKey; icon?: any }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(sortKeyName)}
    >
      <div className="flex items-center gap-1">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Ranking Geral</CardTitle>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          <Button 
            variant={filterType === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('all')}
            className="text-xs h-7 px-2 sm:px-3"
          >
            Todos
          </Button>
          <Button 
            variant={filterType === 'competitor' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('competitor')}
            className="text-xs h-7 px-2 sm:px-3"
          >
            Concorrentes
          </Button>
          <Button 
            variant={filterType === 'prospect' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('prospect')}
            className="text-xs h-7 px-2 sm:px-3"
          >
            Prospects
          </Button>
          <Button 
            variant={filterType === 'client' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterType('client')}
            className="text-xs h-7 px-2 sm:px-3"
          >
            Clientes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 sm:w-12">#</TableHead>
                <SortableHeader label="Empresa" sortKeyName="name" />
                <TableHead className="w-14 sm:w-16">Tipo</TableHead>
                <SortableHeader label="LinkedIn" sortKeyName="linkedin" icon={Linkedin} />
                <TableHead className="hidden sm:table-cell">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('instagram')}>
                    <Instagram className="h-4 w-4" />
                    <span className="hidden md:inline">Instagram</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('youtube')}>
                    <Youtube className="h-4 w-4" />
                    <span className="hidden lg:inline">YouTube</span>
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableHead>
                <SortableHeader label="Glassdoor" sortKeyName="glassdoor" icon={Star} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEntities.slice(0, 10).map((entity, index) => (
                <TableRow 
                  key={entity.id}
                  className={`cursor-pointer hover:bg-muted/50 transition-colors ${entity.type === 'primary' ? 'bg-primary/5' : ''}`}
                  onClick={() => handleRowClick(entity)}
                >
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {entity.logo_url ? (
                        <img 
                          src={entity.logo_url} 
                          alt={entity.name || ''} 
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded object-contain bg-muted flex-shrink-0"
                        />
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span className={`truncate max-w-[100px] sm:max-w-none ${entity.type === 'primary' ? 'font-semibold text-primary' : ''}`}>
                        {entity.name || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(entity.type)}</TableCell>
                  <TableCell style={{ color: SOCIAL_COLORS.linkedin }}>
                    {formatNumber(entity.linkedin_followers)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell" style={{ color: SOCIAL_COLORS.instagram }}>
                    {formatNumber(entity.instagram_followers)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell" style={{ color: SOCIAL_COLORS.youtube }}>
                    {formatNumber(entity.youtube_subscribers)}
                  </TableCell>
                  <TableCell>
                    {entity.glassdoor_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-primary fill-primary" />
                        <span>{entity.glassdoor_rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 pt-4 border-t border-border px-4 sm:px-0 pb-4 sm:pb-0">
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge className="bg-primary text-primary-foreground text-[10px] sm:text-xs">Você</Badge>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Sua empresa</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" style={{ color: ENTITY_COLORS.competitor, borderColor: ENTITY_COLORS.competitor }} className="text-[10px] sm:text-xs">C</Badge>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Concorrente</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" style={{ color: ENTITY_COLORS.prospect, borderColor: ENTITY_COLORS.prospect }} className="text-[10px] sm:text-xs">P</Badge>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Prospect</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="outline" style={{ color: ENTITY_COLORS.client, borderColor: ENTITY_COLORS.client }} className="text-[10px] sm:text-xs">Cl</Badge>
            <span className="text-[10px] sm:text-xs text-muted-foreground">Cliente</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}