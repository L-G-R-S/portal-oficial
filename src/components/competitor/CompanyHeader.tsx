import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Globe,
  MapPin,
  Users,
  Calendar,
  Star,
  Linkedin,
  Instagram,
  Youtube,
  ExternalLink,
  Building2,
} from "lucide-react";

interface CompanyHeaderProps {
  displayData: {
    name?: string | null;
    logo_url?: string | null;
    industry?: string | null;
    headquarters?: string | null;
    size?: string | null;
    year_founded?: number | null;
    website?: string | null;
    linkedin_url?: string | null;
    linkedin_tagline?: string | null;
    instagram_url?: string | null;
    youtube_url?: string | null;
  };
  competitor?: {
    domain?: string;
    hq_location?: string | null;
    location?: string | null;
    employees?: number | null;
    founded_year?: number | null;
    website?: string | null;
    site?: string | null;
    linkedin_url?: string | null;
    linkedin_tagline?: string | null;
    payload_json?: { cover_url?: string };
    industry?: string | null;
  };
  glassdoorRating?: number | null;
}

export function CompanyHeader({ displayData, competitor, glassdoorRating }: CompanyHeaderProps) {
  const coverUrl = competitor?.payload_json?.cover_url;
  const logoUrl = displayData?.logo_url;
  const name = displayData?.name || competitor?.domain || "Empresa";
  const tagline = displayData?.linkedin_tagline || competitor?.linkedin_tagline;
  const industry = (displayData?.industry || competitor?.industry)?.split(',')[0]?.trim();
  const location = displayData?.headquarters || competitor?.hq_location || competitor?.location;
  const size = displayData?.size || (competitor?.employees ? `${competitor.employees} funcionários` : null);
  const founded = displayData?.year_founded || competitor?.founded_year;
  const website = displayData?.website || competitor?.website || competitor?.site;
  const linkedinUrl = displayData?.linkedin_url || competitor?.linkedin_url;
  const instagramUrl = displayData?.instagram_url;
  const youtubeUrl = displayData?.youtube_url;

  return (
    <Card className="overflow-hidden">
      {coverUrl && (
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
          <img 
            src={coverUrl} 
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}
      
      <CardContent className={coverUrl ? "pt-0 -mt-12 relative" : "pt-6"}>
        <div className="flex items-start gap-6">
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt={name}
                className="w-24 h-24 object-contain rounded-xl border-4 border-background bg-background shadow-lg"
              />
            </div>
          )}
          
          <div className="flex-1 space-y-4 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{name}</h1>
                {tagline && (
                  <p className="text-muted-foreground mt-1 text-lg">{tagline}</p>
                )}
              </div>
              {glassdoorRating && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 text-muted-foreground shrink-0 cursor-default">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{glassdoorRating}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Avaliação no Glassdoor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {industry && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {industry}
                </Badge>
              )}
              {location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {location}
                </Badge>
              )}
              {size && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {size}
                </Badge>
              )}
              {founded && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Fundada em {founded}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {linkedinUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {instagramUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
              {youtubeUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 mr-2" />
                    YouTube
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
