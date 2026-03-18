import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Linkedin, Instagram, Youtube, Users, Video, Eye } from "lucide-react";

interface SocialMetricsCardsProps {
  linkedin?: {
    followers?: number | null;
  };
  instagram?: {
    followers?: number | null;
    posts_count?: number | null;
  };
  youtube?: {
    subscribers?: number | null;
    total_videos?: number | null;
    total_views?: number | null;
  };
}

export function SocialMetricsCards({ linkedin, instagram, youtube }: SocialMetricsCardsProps) {
  const hasLinkedin = linkedin?.followers;
  const hasInstagram = instagram?.followers;
  const hasYoutube = youtube?.subscribers;

  if (!hasLinkedin && !hasInstagram && !hasYoutube) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {hasLinkedin && (
        <Card className="bg-gradient-to-br from-[#0077B5]/10 to-[#0077B5]/5 border-[#0077B5]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-[#0077B5]">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{linkedin.followers?.toLocaleString('pt-BR')}</span>
              <span className="text-sm text-muted-foreground">seguidores</span>
            </div>
          </CardContent>
        </Card>
      )}

      {hasInstagram && (
        <Card className="bg-gradient-to-br from-[#E4405F]/10 to-[#E4405F]/5 border-[#E4405F]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-[#E4405F]">
              <Instagram className="h-4 w-4" />
              Instagram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{instagram.followers?.toLocaleString('pt-BR')}</span>
              <span className="text-sm text-muted-foreground">seguidores</span>
            </div>
            {instagram.posts_count && (
              <p className="text-xs text-muted-foreground">
                {instagram.posts_count.toLocaleString('pt-BR')} posts
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {hasYoutube && (
        <Card className="bg-gradient-to-br from-[#FF0000]/10 to-[#FF0000]/5 border-[#FF0000]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-[#FF0000]">
              <Youtube className="h-4 w-4" />
              YouTube
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{youtube.subscribers?.toLocaleString('pt-BR')}</span>
              <span className="text-sm text-muted-foreground">inscritos</span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              {youtube.total_videos && (
                <span className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  {youtube.total_videos.toLocaleString('pt-BR')} vídeos
                </span>
              )}
              {youtube.total_views && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {youtube.total_views.toLocaleString('pt-BR')} views
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
