import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Linkedin, Instagram, Youtube } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { SOCIAL_COLORS } from '@/lib/colors';

interface CompanyHeroProps {
  company: {
    name: string | null;
    logo_url: string | null;
    industry: string | null;
    linkedin_followers: number | null;
    instagram_followers: number | null;
    youtube_subscribers: number | null;
  } | null;
  linkedinRank?: number;
  totalCompetitors?: number;
}

export function CompanyHero({ company, linkedinRank, totalCompetitors }: CompanyHeroProps) {
  if (!company) {
    return (
      <Card className="p-6 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Configure sua empresa</h2>
            <p className="text-secondary-foreground/70 text-sm">
              Vá em Configurações para adicionar sua empresa principal
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10 w-full min-w-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 w-full">
          {/* Company Info */}
          <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 flex-1 min-w-0">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name || 'Logo'} 
                className="w-20 h-20 md:w-16 md:h-16 rounded-lg object-contain bg-background/10 p-1 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 md:w-16 md:h-16 rounded-lg bg-background/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 md:h-8 md:w-8" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-2xl md:text-xl font-bold truncate">{company.name || 'Sua Empresa'}</h2>
              {company.industry && (
                <p className="mt-2 md:mt-1 text-sm text-secondary-foreground/80 leading-snug mx-auto max-w-[280px] md:mx-0 md:max-w-full">
                  {company.industry}
                </p>
              )}
            </div>
          </div>

          {/* Social Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full lg:w-auto">
            <div className="text-center p-2 sm:p-3 rounded-lg bg-background/10">
              <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" style={{ color: SOCIAL_COLORS.linkedin }} />
              <p className="text-base sm:text-lg font-bold">{formatNumber(company.linkedin_followers)}</p>
              <p className="text-[10px] sm:text-xs text-secondary-foreground/70">LinkedIn</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-background/10">
              <Instagram className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" style={{ color: SOCIAL_COLORS.instagram }} />
              <p className="text-base sm:text-lg font-bold">{formatNumber(company.instagram_followers)}</p>
              <p className="text-[10px] sm:text-xs text-secondary-foreground/70">Instagram</p>
            </div>
            <div className="text-center p-2 sm:p-3 rounded-lg bg-background/10">
              <Youtube className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1" style={{ color: SOCIAL_COLORS.youtube }} />
              <p className="text-base sm:text-lg font-bold">{formatNumber(company.youtube_subscribers)}</p>
              <p className="text-[10px] sm:text-xs text-secondary-foreground/70">YouTube</p>
            </div>
          </div>
        </div>

        {/* Ranking Badge */}
        {linkedinRank && totalCompetitors !== undefined && (
          <div className="mt-6 md:mt-4 pt-4 border-t border-secondary-foreground/20 text-center md:text-left">
            <p className="text-sm text-secondary-foreground/80">
              Você está em <span className="font-bold text-primary">{linkedinRank}º lugar</span> no LinkedIn comparado a {totalCompetitors} concorrentes
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}