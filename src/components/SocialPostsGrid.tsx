import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2, Eye, ExternalLink, Play, ImageOff, Linkedin, Instagram, Youtube, Download } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { formatDateBR } from "@/lib/formatters";
import { toast } from "sonner";
// Componente para fallback visual melhorado
const MediaFallback = ({ 
  type, 
  postUrl, 
  compact = false 
}: { 
  type: "linkedin" | "instagram" | "youtube"; 
  postUrl: string | null;
  compact?: boolean;
}) => {
  const iconSize = compact ? "h-10 w-10" : "h-12 w-12";
  const textSize = compact ? "text-xs" : "text-sm";
  
  const gradients = {
    linkedin: "from-[#0077B5]/10 to-[#0077B5]/5",
    instagram: "from-[#E4405F]/10 via-[#F77737]/10 to-[#FCAF45]/5",
    youtube: "from-[#FF0000]/10 to-[#FF0000]/5",
  };
  
  const iconColors = {
    linkedin: "text-[#0077B5]/50",
    instagram: "text-[#E4405F]/50",
    youtube: "text-[#FF0000]/50",
  };
  
  const icons = {
    linkedin: Linkedin,
    instagram: Instagram,
    youtube: Youtube,
  };
  
  const Icon = icons[type];
  
  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${gradients[type]}`}>
      <Icon className={`${iconSize} ${iconColors[type]} mb-2`} />
      <span className={`${textSize} text-muted-foreground font-medium`}>Mídia não disponível</span>
      {postUrl && (
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Ver post original
        </a>
      )}
    </div>
  );
};

// Proxy de imagem para bypass de URLs expiradas do Instagram
const IMAGE_PROXY = "https://images.weserv.nl/?url=";

// Gera URL de imagem alternativa via proxy
const getProxiedImageUrl = (originalUrl: string): string => {
  // Remove o protocolo para o proxy
  const urlWithoutProtocol = originalUrl.replace(/^https?:\/\//, '');
  return `${IMAGE_PROXY}${encodeURIComponent(urlWithoutProtocol)}`;
};

interface LinkedInPost {
  id: string;
  text: string;
  post_type: string;
  posted_at: string;
  url: string | null;
  total_reactions?: number;
  likes?: number;
  loves?: number;
  celebrates?: number;
  reposts?: number;
  comments?: number;
  media_type?: string | null;
  media_url?: string | null;
  media_thumbnail?: string | null;
  media_duration_ms?: number | null;
  cached_thumbnail_url?: string | null;
  stats?: {
    total_reactions: number;
    like: number;
    love: number;
    celebrate: number;
    reposts: number;
    comments: number;
  };
  media?: {
    type: string | null;
    url: string | null;
    thumbnail: string | null;
    duration: number | null;
  };
}

interface InstagramPost {
  id: string;
  caption: string;
  url: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string | null;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number | null;
  timestamp: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string | null;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number | null;
  mentions?: string[];
  hashtags?: string[];
  cached_thumbnail_url?: string | null;
}

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  view_count?: number;
  comments_count?: number;
  published_at?: string;
  thumbnailUrl?: string;
  viewCount?: number;
  commentsCount?: number;
  publishedAt?: string;
  likes?: number;
}

type SocialPost = LinkedInPost | InstagramPost | YouTubeVideo;

interface SocialPostsGridProps {
  posts: SocialPost[];
  type: "linkedin" | "instagram" | "youtube";
}

export default function SocialPostsGrid({ posts, type }: SocialPostsGridProps) {
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [proxyFailedImages, setProxyFailedImages] = useState<Set<string>>(new Set());

  if (!posts || posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Nenhum post encontrado</p>
        </CardContent>
      </Card>
    );
  }


  const getThumbnail = (post: SocialPost, useProxy = false) => {
    if (type === "linkedin") {
      const p = post as LinkedInPost;
      // Priorizar URL cacheada (permanente)
      if (p.cached_thumbnail_url) return p.cached_thumbnail_url;
      const url = p.media_thumbnail ?? p.media?.thumbnail ?? p.media_url ?? p.media?.url ?? null;
      return useProxy && url ? getProxiedImageUrl(url) : url;
    }
    if (type === "instagram") {
      const p = post as InstagramPost;
      // Priorizar URL cacheada (permanente)
      if (p.cached_thumbnail_url) return p.cached_thumbnail_url;
      const thumb = p.thumbnailUrl ?? p.thumbnail_url;
      const media = p.mediaUrl ?? p.media_url;
      const mediaType = p.mediaType ?? p.media_type;
      
      let url: string | null = null;
      if (mediaType === "video") {
        url = thumb ?? media ?? null;
      } else {
        url = media ?? thumb ?? null;
      }
      
      return useProxy && url ? getProxiedImageUrl(url) : url;
    }
    if (type === "youtube") {
      const p = post as YouTubeVideo;
      const url = p.thumbnail_url ?? p.thumbnailUrl ?? null;
      return useProxy && url ? getProxiedImageUrl(url) : url;
    }
    return null;
  };

  const handleImageError = useCallback((postId: string, imgElement: HTMLImageElement) => {
    // Se já tentou proxy e falhou, mostra fallback
    if (proxyFailedImages.has(postId)) {
      imgElement.style.display = 'none';
      const fallback = imgElement.nextElementSibling;
      if (fallback) fallback.classList.remove('hidden');
      return;
    }
    
    // Se já tentou URL original e falhou, agora tentando proxy
    if (failedImages.has(postId)) {
      // Marca que proxy também falhou
      setProxyFailedImages(prev => new Set(prev).add(postId));
      imgElement.style.display = 'none';
      const fallback = imgElement.nextElementSibling;
      if (fallback) fallback.classList.remove('hidden');
      return;
    }
    
    // Primeira falha - marca para tentar com proxy
    setFailedImages(prev => new Set(prev).add(postId));
  }, [failedImages, proxyFailedImages]);

  const getText = (post: SocialPost) => {
    if (type === "linkedin") return (post as LinkedInPost).text;
    if (type === "instagram") return (post as InstagramPost).caption;
    if (type === "youtube") return (post as YouTubeVideo).title;
    return "";
  };

  const getDate = (post: SocialPost) => {
    if (type === "linkedin") return (post as LinkedInPost).posted_at;
    if (type === "instagram") return (post as InstagramPost).timestamp;
    if (type === "youtube") {
      const p = post as YouTubeVideo;
      return p.published_at ?? p.publishedAt ?? "";
    }
    return "";
  };

  const getStats = (post: SocialPost) => {
    if (type === "linkedin") {
      const p = post as LinkedInPost;
      const totalReactions = p.total_reactions ?? p.stats?.total_reactions ?? 0;
      const comments = p.comments ?? p.stats?.comments ?? 0;
      const reposts = p.reposts ?? p.stats?.reposts ?? 0;
      return [
        { icon: Heart, value: totalReactions, label: "reações" },
        { icon: MessageCircle, value: comments, label: "comentários" },
        { icon: Repeat2, value: reposts, label: "reposts" },
      ];
    }
    if (type === "instagram") {
      const p = post as InstagramPost;
      const likes = p.likes_count ?? p.likesCount ?? 0;
      const comments = p.comments_count ?? p.commentsCount ?? 0;
      return [
        { icon: Heart, value: likes, label: "curtidas" },
        { icon: MessageCircle, value: comments, label: "comentários" },
      ];
    }
    if (type === "youtube") {
      const p = post as YouTubeVideo;
      const views = p.view_count ?? p.viewCount ?? 0;
      const likes = p.likes ?? 0;
      const comments = p.comments_count ?? p.commentsCount ?? 0;
      return [
        { icon: Eye, value: views, label: "visualizações" },
        { icon: Heart, value: likes, label: "curtidas" },
        { icon: MessageCircle, value: comments, label: "comentários" },
      ];
    }
    return [];
  };

  const getMediaType = (post: SocialPost) => {
    if (type === "linkedin") {
      const p = post as LinkedInPost;
      return p.media_type ?? p.media?.type ?? null;
    }
    if (type === "instagram") {
      const p = post as InstagramPost;
      return p.media_type ?? p.mediaType ?? null;
    }
    if (type === "youtube") return "video";
    return null;
  };

  const getPostUrl = (post: SocialPost) => {
    if (type === "linkedin") {
      const p = post as LinkedInPost;
      const postId = (p as any).external_id || p.id;
      return p.url || (postId ? `https://www.linkedin.com/feed/update/urn:li:activity:${postId}` : null);
    }
    if (type === "instagram") return (post as InstagramPost).url;
    if (type === "youtube") return (post as YouTubeVideo).url;
    return null;
  };

  const handleDownload = async (e: React.MouseEvent, post: SocialPost) => {
    e.stopPropagation();
    const useProxy = failedImages.has(post.id);
    const url = getThumbnail(post, useProxy);
    
    if (!url) {
      toast.error("Mídia não disponível para download");
      return;
    }
    
    try {
      toast.loading("Baixando mídia...", { id: "download" });
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Falha ao baixar");
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Gerar nome do arquivo
      const date = getDate(post);
      const dateStr = date ? new Date(date).toISOString().split('T')[0] : 'post';
      const extension = blob.type.includes('video') ? 'mp4' : 'jpg';
      link.download = `${type}_${dateStr}_${post.id.slice(0, 8)}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Download concluído!", { id: "download" });
    } catch (error) {
      console.error("Erro ao baixar mídia:", error);
      toast.error("Erro ao baixar mídia. Tente acessar o post original.", { id: "download" });
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => {
          const useProxy = failedImages.has(post.id);
          const thumbnail = getThumbnail(post, useProxy);
          const text = getText(post);
          const date = getDate(post);
          const stats = getStats(post);
          const mediaType = getMediaType(post);
          const postUrl = getPostUrl(post);

          return (
            <Card
              key={post.id}
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
              onClick={() => setSelectedPost(post)}
            >
              <div className="relative aspect-video bg-muted">
                {thumbnail && !proxyFailedImages.has(post.id) ? (
                  <>
                    <img
                      src={thumbnail}
                      alt="Post thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(post.id, e.currentTarget)}
                    />
                    <div className="hidden">
                      <MediaFallback type={type} postUrl={postUrl} compact />
                    </div>
                  </>
                ) : (
                  <MediaFallback type={type} postUrl={postUrl} compact />
                )}
                {mediaType === "video" && thumbnail && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-primary rounded-full p-3">
                      <Play className="h-6 w-6 text-primary-foreground fill-current" />
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {thumbnail && !proxyFailedImages.has(post.id) && (
                    <button
                      onClick={(e) => handleDownload(e, post)}
                      className="bg-background/90 hover:bg-background rounded-full p-2 shadow-sm transition-colors"
                      title="Baixar mídia"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  {postUrl && (
                    <a
                      href={postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background/90 hover:bg-background rounded-full p-2 shadow-sm transition-colors"
                      title="Abrir post original"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-foreground line-clamp-3">
                  {text}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{formatDateBR(date)}</Badge>
                </div>
                <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <stat.icon className="h-3 w-3" />
                      <span>{stat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <VisuallyHidden>
            <DialogTitle>Detalhes do post</DialogTitle>
            <DialogDescription>Visualização detalhada do post de rede social</DialogDescription>
          </VisuallyHidden>
          {selectedPost && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {type === "youtube" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${(selectedPost as any).external_id || (selectedPost as YouTubeVideo).id}`}
                    title="YouTube video player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : getThumbnail(selectedPost, failedImages.has(selectedPost.id)) && !proxyFailedImages.has(selectedPost.id) ? (
                  <>
                    <img
                      src={getThumbnail(selectedPost, failedImages.has(selectedPost.id))!}
                      alt="Post media"
                      className="w-full h-full object-contain"
                      onError={(e) => handleImageError(selectedPost.id, e.currentTarget)}
                    />
                    <div className="hidden">
                      <MediaFallback type={type} postUrl={getPostUrl(selectedPost)} />
                    </div>
                    {getMediaType(selectedPost) === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </>
                ) : (
                  <MediaFallback type={type} postUrl={getPostUrl(selectedPost)} />
                )}
              </div>

              <div className="space-y-3">
                <p className="text-foreground whitespace-pre-wrap">
                  {getText(selectedPost)}
                </p>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {formatDateBR(getDate(selectedPost))}
                  </Badge>
                </div>

                <div className="flex items-center gap-6 pt-2 border-t">
                  {getStats(selectedPost).map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {stat.value.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  {getThumbnail(selectedPost, failedImages.has(selectedPost.id)) && !proxyFailedImages.has(selectedPost.id) && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => handleDownload(e, selectedPost)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar mídia
                    </Button>
                  )}
                  {getPostUrl(selectedPost) && (
                    <Button
                      asChild
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <a
                        href={getPostUrl(selectedPost)!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver post original
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}