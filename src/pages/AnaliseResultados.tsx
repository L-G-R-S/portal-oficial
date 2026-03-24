import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  ExternalLink, 
  Building2,
  Users,
  MapPin,
  Calendar,
  Globe,
  Linkedin,
  Star,
  Save,
  Loader2,
  Youtube,
  Instagram,
  UserCircle,
  Briefcase,
  Award,
  Target,
  TrendingUp,
  Sparkles,
  Newspaper,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import SocialPostsGrid from "@/components/SocialPostsGrid";

export default function AnaliseResultados() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const { webhookData, domain } = location.state as { 
    webhookData?: any;
    domain?: string;
  } || {};

  const [data] = useState<any>(() => {
    let wData = Array.isArray(webhookData) ? webhookData[0] : (webhookData || {});
    if (wData && wData.json) wData = wData.json;
    return wData;
  });

  // Nova estrutura do JSON: company, linkedin_info, mercado_raw_research ...
  const overview = data?.company || data?.linkedin_info || data?.overview || {};
  const redesSociais = data?.redes_sociais || {
    linkedin: { posts: data?.linkedin_posts, url: overview?.linkedin_url, followers: data?.linkedin_info?.followers, ...data?.linkedin_info },
    instagram: { posts: data?.instagram_posts, ...data?.instagram_info },
    youtube: data?.youtube_info 
  };
  const glassdoor = data?.glassdoor_info || data?.glassdoor || {};
  const mercado = data?.mercado || data?.market_research_raw || {};
  const mercadoCompany = mercado?.company || {};

  // Extrair dados do overview
  const companyName = overview.nome || overview.name || '';
  const companyWebsite = overview.website || overview.site_institucional || '';
  const companyDescription = overview.descricao_institucional || overview.description || '';
  const companyIndustry = overview.setor || overview.industry || '';
  const companyHeadquarters = redesSociais?.linkedin?.headquarters || overview.endereco || overview.headquarters || '';
  const companySize = redesSociais?.linkedin?.company_size || overview.company_size || '';
  const companyFounded = redesSociais?.linkedin?.founded || overview.founded || '';
  const companyLogoUrl = data?.linkedin_logo || overview.logo_url || data?.linkedin_info?.profile_pic_url || data?.linkedin_info?.logoUrl || redesSociais?.linkedin?.profile_pic_url || '';
  const companyCoverUrl = overview.cover_url || '';
  const companyTagline = redesSociais?.linkedin?.tagline || overview.tagline || data?.linkedin_info?.tagline || '';
  const companySpecialties = redesSociais?.linkedin?.specialties || overview.specialties || overview.especialidades || data?.linkedin_info?.specialties || data?.linkedin_info?.especialidades || data?.company?.specialties || data?.company?.especialidades || [];
  const companyProdutosServicos = overview.produtos_servicos || overview.products_services || '';
  const companyDiferenciais = overview.diferenciais || overview.differentiators || '';
  
  const companyMercadoAlvo = Array.isArray(mercadoCompany?.mercado_alvo) 
    ? mercadoCompany.mercado_alvo.join(", ") 
    : (mercadoCompany?.mercado_alvo || overview.mercado_alvo || overview.market || '');
    
  const companyModeloNegocio = mercadoCompany?.modelo_negocio || overview.modelo_negocio || overview.business_model || '';
  const companyClientes = mercadoCompany?.clientes_citados || overview.clientes_citados || overview.clientes_citados_publicamente || overview.clients || '';
  const companyParceiros = mercadoCompany?.parceiros || overview.parceiros || overview.partners || null;
  const overallAnalysis = mercado?.strategic_analysis?.resumo_executivo || overview.overall_analysis || '';
  const positioning = mercado?.positioning || overview.positioning || {};
  const strategicAnalysis = mercado?.strategic_analysis || data?.market_research_raw?.strategic_analysis || null;
  const leadership = mercadoCompany?.pessoas_chave || overview.pessoas_chave || overview.lideranca_oficial || overview.lideranca || [];
  const references = mercado?.references || overview.references || [];

  // Extrair dados de redes sociais
  const linkedinData = redesSociais.linkedin || {};
  const instagramData = redesSociais.instagram || {};
  const youtubeData = redesSociais.youtube || {};

  // Posts de redes sociais
  const linkedinPosts = linkedinData.posts || [];
  const instagramPosts = instagramData.posts || [];
  const youtubeVideos = youtubeData.videos || [];
  const blogPosts = data?.blog_posts || [];

  // Extrair dados do mercado
  const acoesPublicas = mercado.acoes_publicas_eventos || mercado.eventos || [];
  const newsAndActions = mercado.news_and_actions || mercado.noticias || mercado.news_and_market_actions || [];
  const similarCompanies = mercado.similar_companies || overview.similar_companies || data?.similar_companies || data?.linkedin_info?.similar_companies || [];

  const handleSave = async () => {
    if (!companyName || !domain) return;
    
    setIsSaving(true);
    try {
      // Preparar produtos e serviços como array
      const produtosArray = typeof companyProdutosServicos === 'string' 
        ? companyProdutosServicos.split(',').map(s => s.trim()).filter(Boolean)
        : companyProdutosServicos;
      
      const diferenciaisArray = typeof companyDiferenciais === 'string'
        ? companyDiferenciais.split(',').map(s => s.trim()).filter(Boolean)
        : companyDiferenciais;

      // Salvar na tabela companies
      const companyData = {
        domain: domain,
        name: companyName,
        website: companyWebsite,
        description: companyDescription,
        industry: companyIndustry,
        headquarters: companyHeadquarters,
        size: companySize || data?.linkedin_info?.company_size || undefined,
        employee_count: data?.linkedin_info?.employee_count || undefined,
        company_type: data?.linkedin_info?.company_type || undefined,
        year_founded: companyFounded ? parseInt(companyFounded) : (data?.linkedin_info?.founded ? parseInt(data?.linkedin_info?.founded) : null),
        logo_url: companyLogoUrl,
        market: companyMercadoAlvo,
        business_model: companyModeloNegocio,
        products_services: produtosArray,
        differentiators: diferenciaisArray,
        partners: companyParceiros ? [companyParceiros] : [],
        clients: companyClientes,
        linkedin_url: overview.linkedin_url || linkedinData.url,
        linkedin_followers: linkedinData.followers || data?.linkedin_info?.followers,
        linkedin_specialties: companySpecialties,
        linkedin_tagline: companyTagline,
        instagram_url: overview.instagram_url || instagramData.profile_url,
        instagram_username: instagramData.username,
        instagram_followers: instagramData.followersCount,
        instagram_follows: instagramData.followsCount,
        instagram_posts_count: instagramData.postsCount,
        instagram_bio: instagramData.bio,
        youtube_url: overview.youtube_url || youtubeData.channel?.url,
        youtube_channel_name: youtubeData.channel?.name,
        youtube_subscribers: youtubeData.channel?.subscribers,
        youtube_total_views: youtubeData.channel?.totalViews,
        youtube_total_videos: youtubeData.channel?.totalVideos,
      };

      const { data: upsertedCompany, error: companyError } = await supabase
        .from('companies')
        .upsert(companyData, { onConflict: 'domain' })
        .select()
        .single();

      if (companyError) throw companyError;

      // Salvar posts do LinkedIn
      if (linkedinPosts.length > 0) {
        await supabase.from('linkedin_posts').delete().eq('company_id', upsertedCompany.id);
        
        const posts = linkedinPosts.map((post: any) => ({
          company_id: upsertedCompany.id,
          external_id: post.id?.toString(),
          text: post.text || null,
          post_type: post.post_type || null,
          posted_at: post.posted_at || null,
          url: post.url || `https://www.linkedin.com/feed/update/${post.id}`,
          total_reactions: post.stats?.total_reactions || 0,
          likes: post.stats?.like || 0,
          loves: post.stats?.love || 0,
          celebrates: post.stats?.celebrate || 0,
          reposts: post.stats?.reposts || 0,
          comments: post.stats?.comments || 0,
          media_type: post.media?.type || null,
          media_url: post.media?.url || null,
          media_thumbnail: post.media?.thumbnail || null,
          media_duration_ms: post.media?.duration || null,
        }));
        
        await supabase.from('linkedin_posts').insert(posts);
      }

      // Salvar posts do Instagram
      if (instagramPosts.length > 0) {
        await supabase.from('instagram_posts').delete().eq('company_id', upsertedCompany.id);
        
        const posts = instagramPosts.map((post: any) => ({
          company_id: upsertedCompany.id,
          external_id: post.id?.toString(),
          caption: post.caption || null,
          url: post.url || null,
          media_type: post.mediaType || null,
          media_url: post.mediaUrl || null,
          thumbnail_url: post.thumbnailUrl || null,
          likes_count: post.likesCount || 0,
          comments_count: post.commentsCount || 0,
          shares_count: post.sharesCount || null,
          timestamp: post.timestamp || null,
          mentions: post.mentions?.join(',') || null,
          hashtags: post.hashtags?.join(',') || null,
        }));
        
        await supabase.from('instagram_posts').insert(posts);
      }

      // Salvar vídeos do YouTube
      if (youtubeVideos.length > 0) {
        await supabase.from('youtube_videos').delete().eq('company_id', upsertedCompany.id);
        
        const videos = youtubeVideos.map((video: any) => ({
          company_id: upsertedCompany.id,
          external_id: video.id?.toString(),
          title: video.title || null,
          url: video.url || `https://www.youtube.com/watch?v=${video.id}`,
          thumbnail_url: video.thumbnailUrl || null,
          view_count: video.viewCount || 0,
          likes: video.likes || 0,
          comments_count: video.commentsCount || 0,
          published_at: video.publishedAt || null,
        }));
        
        await supabase.from('youtube_videos').insert(videos);
      }

      // Salvar na tabela competitors para aparecer na lista
      const totalGlassdoorReviews = glassdoor?.rating_distribution
        ? (glassdoor.rating_distribution.one_star ?? 0)
          + (glassdoor.rating_distribution.two_stars ?? 0)
          + (glassdoor.rating_distribution.three_stars ?? 0)
          + (glassdoor.rating_distribution.four_stars ?? 0)
          + (glassdoor.rating_distribution.five_stars ?? 0)
        : null;

      await supabase.from('competitors').upsert({
        domain,
        name: companyName,
        sector: companyIndustry,
        hq_location: companyHeadquarters,
        website: companyWebsite,
        linkedin_url: overview.linkedin_url || linkedinData.url,
        linkedin_followers: linkedinData.followers,
        site: companyWebsite,
        industry: companyIndustry,
        location: companyHeadquarters,
        logo_url: companyLogoUrl,
        short_description: companyDescription,
        general_summary: overallAnalysis,
        glassdoor_rating: glassdoor?.overall_rating ?? null,
        glassdoor_reviews: totalGlassdoorReviews,
        products_services: produtosArray,
        differentiators: diferenciaisArray,
        linkedin_tagline: companyTagline,
        linkedin_specialties: companySpecialties,
        instagram_followers: instagramData.followersCount,
        instagram_posts_count: instagramData.postsCount,
        youtube_subscribers: youtubeData.channel?.subscribers,
        youtube_total_videos: youtubeData.channel?.totalVideos,
        youtube_total_views: youtubeData.channel?.totalViews,
      }, { onConflict: 'domain' });

      // Salvar Glassdoor
      if (glassdoor && Object.keys(glassdoor).length > 0) {
        await supabase.from('glassdoor_summary').delete().eq('company_id', upsertedCompany.id);
        
        const glassdoorData = {
          company_id: upsertedCompany.id,
          overall_rating: glassdoor.overall_rating ?? null,
          compensation_benefits_rating: glassdoor.compensation_benefits_rating ?? null,
          culture_values_rating: glassdoor.culture_values_rating ?? null,
          career_opportunities_rating: glassdoor.career_opportunities_rating ?? null,
          work_life_balance_rating: glassdoor.work_life_balance_rating ?? null,
          diversity_inclusion_rating: glassdoor.diversity_inclusion_rating ?? null,
          recommend_to_friend: glassdoor.recommend_to_friend ?? null,
          ceo_rating: glassdoor.ceo_rating ?? null,
          ratings_one_star: glassdoor.rating_distribution?.one_star ?? null,
          ratings_two_stars: glassdoor.rating_distribution?.two_stars ?? null,
          ratings_three_stars: glassdoor.rating_distribution?.three_stars ?? null,
          ratings_four_stars: glassdoor.rating_distribution?.four_stars ?? null,
          ratings_five_stars: glassdoor.rating_distribution?.five_stars ?? null,
          pros_example: glassdoor.pros_example ?? null,
          cons_example: glassdoor.cons_example ?? null,
          advice_example: glassdoor.advice_example ?? null,
        };
        
        await supabase.from('glassdoor_summary').insert(glassdoorData);
      }

      // Salvar market research
      if (positioning || overallAnalysis) {
        await supabase.from('market_research').upsert({
          company_id: upsertedCompany.id,
          central_message: positioning.discurso_institucional,
          topics_discussed: positioning.topicos_recorrentes?.join(', '),
          overall_analysis: overallAnalysis,
          source_references: references.join('\n'),
          institutional_discourse: positioning.discurso_institucional,
          recurring_topics: positioning.topicos_recorrentes || [],
          institutional_curiosities: positioning.curiosidades ? [positioning.curiosidades] : [],
          events: acoesPublicas,
          website_url: positioning.presenca_digital?.site,
          blog_url: positioning.presenca_digital?.blog,
        }, { onConflict: 'company_id' });
      }

      // Salvar empresas similares
      if (similarCompanies.length > 0) {
        await supabase.from('similar_companies').delete().eq('company_id', upsertedCompany.id);
        
        const companies = similarCompanies
          .filter((comp: any) => comp.name)
          .map((comp: any) => ({
            company_id: upsertedCompany.id,
            name: comp.name,
            industry: comp.industry,
            location: comp.location,
            url: comp.url,
            logo_url: comp.logo_url,
            source: 'linkedin_similar',
          }));
        
        if (companies.length > 0) {
          await supabase.from('similar_companies').insert(companies);
        }
      }

      // Salvar liderança
      if (leadership.length > 0) {
        await supabase.from('company_leadership').delete().eq('company_id', upsertedCompany.id);
        
        const uniqueLeaders = Array.from(
          new Map(
            leadership.map((leader: any) => [
              `${leader.linkedin || ''}-${leader.nome}`,
              {
                company_id: upsertedCompany.id,
                name: leader.nome,
                position: leader.cargo,
                linkedin_url: leader.linkedin || null,
                source: leader.url_fonte || null,
              }
            ])
          ).values()
        );
        
        if (uniqueLeaders.length > 0) {
          await supabase.from('company_leadership').insert(uniqueLeaders);
        }
      }

      // Salvar notícias
      if (newsAndActions.length > 0) {
        await supabase.from('market_news').delete().eq('company_id', upsertedCompany.id);
        
        const news = newsAndActions.map((item: any) => ({
          company_id: upsertedCompany.id,
          title: item.titulo || item.title,
          url: item.url,
          date: item.data || item.date,
          summary: item.resumo || item.summary,
          classification: item.tipo || item.classification,
        }));
        
        await supabase.from('market_news').insert(news);
      }

      toast({
        title: "Concorrente salvo!",
        description: `${companyName} foi salvo com sucesso.`,
      });

      navigate('/competitors');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Não foi possível salvar o concorrente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!companyName) {
    return (
      <div className="space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/analise-inteligente')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              Nenhum dado de análise disponível. Faça uma nova análise.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/analise-inteligente')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Nova Análise
        </Button>
        
        <Button 
          variant="default"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Salvar Concorrente
            </>
          )}
        </Button>
      </div>

      {/* Company Header Card - Estilo Premium igual ao CompetitorDetail */}
      <Card className="overflow-hidden">
        {companyCoverUrl && (
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
            <img 
              src={companyCoverUrl} 
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}
        
        <CardContent className={companyCoverUrl ? "pt-0 -mt-12 relative" : "pt-6"}>
          <div className="flex items-start gap-6">
            {companyLogoUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={companyLogoUrl} 
                  alt={companyName}
                  className="w-24 h-24 object-contain rounded-xl border-4 border-background bg-background shadow-lg"
                />
              </div>
            )}
            
            <div className="flex-1 space-y-4 pt-4">
              <div>
                <h1 className="text-3xl font-bold">{companyName}</h1>
                {companyTagline && (
                  <p className="text-muted-foreground mt-1 text-lg">{companyTagline}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {companyIndustry && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {companyIndustry}
                  </Badge>
                )}
                {companyHeadquarters && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {companyHeadquarters}
                  </Badge>
                )}
                {companySize && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {companySize}
                  </Badge>
                )}
                {companyFounded && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Fundada em {companyFounded}
                  </Badge>
                )}
                {glassdoor?.overall_rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {glassdoor.overall_rating} Glassdoor
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {companyWebsite && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={companyWebsite} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {(overview.linkedin_url || linkedinData.url) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={overview.linkedin_url || linkedinData.url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {(overview.instagram_url || instagramData.profile_url) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={overview.instagram_url || instagramData.profile_url} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {(overview.youtube_url || youtubeData.channel?.url) && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={overview.youtube_url || youtubeData.channel?.url} target="_blank" rel="noopener noreferrer">
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

      {/* Content Tabs - Mesma estrutura do CompetitorDetail */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          <TabsTrigger value="glassdoor">Glassdoor</TabsTrigger>
          <TabsTrigger value="mercado">Mercado</TabsTrigger>
        </TabsList>
        
        {/* ==================== OVERVIEW TAB ==================== */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Descrição Institucional */}
          {companyDescription && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Sobre a Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {companyDescription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Grid de Informações Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyProdutosServicos && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Produtos e Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{companyProdutosServicos}</p>
                </CardContent>
              </Card>
            )}

            {companyDiferenciais && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Diferenciais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{companyDiferenciais}</p>
                </CardContent>
              </Card>
            )}

            {companyMercadoAlvo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Mercado Alvo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{companyMercadoAlvo}</p>
                </CardContent>
              </Card>
            )}

            {companyModeloNegocio && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Modelo de Negócio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{companyModeloNegocio}</p>
                </CardContent>
              </Card>
            )}

            {companyClientes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{companyClientes}</p>
                </CardContent>
              </Card>
            )}

            {companyParceiros && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Parceiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{companyParceiros}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Especialidades */}
          {companySpecialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {companySpecialties.map((spec: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liderança */}
          {leadership.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  Liderança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leadership.slice(0, 6).map((leader: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <h4 className="font-semibold">{leader.nome}</h4>
                      {leader.cargo && (
                        <p className="text-sm text-muted-foreground mt-1">{leader.cargo}</p>
                      )}
                      {leader.linkedin && (
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-3" asChild>
                          <a href={leader.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <Linkedin className="h-3 w-3" />
                            Ver LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tópicos Recorrentes */}
          {positioning.topicos_recorrentes?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tópicos Recorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {positioning.topicos_recorrentes.map((topic: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise Geral */}
          {overallAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Análise Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {overallAnalysis}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* ==================== REDES SOCIAIS TAB ==================== */}
        <TabsContent value="redes" className="mt-6 space-y-6">
          {/* Cards de Estatísticas das Redes Sociais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {linkedinData.followers && (
              <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Linkedin className="h-8 w-8 text-blue-600" />
                    {linkedinData.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={linkedinData.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-blue-600">
                    {linkedinData.followers.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">seguidores no LinkedIn</p>
                </CardContent>
              </Card>
            )}
            
            {instagramData.followersCount && (
              <Card className="border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-600/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Instagram className="h-8 w-8 text-pink-600" />
                    {instagramData.profile_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={instagramData.profile_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-pink-600">
                    {instagramData.followersCount.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    seguidores • {instagramData.postsCount || 0} posts
                  </p>
                </CardContent>
              </Card>
            )}
            
            {youtubeData.channel?.subscribers && (
              <Card className="border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <Youtube className="h-8 w-8 text-red-600" />
                    {youtubeData.channel?.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={youtubeData.channel.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-red-600">
                    {youtubeData.channel.subscribers.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    inscritos • {youtubeData.channel.totalVideos || 0} vídeos
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs Internas para Posts */}
          <Tabs defaultValue="linkedin" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="linkedin" className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex items-center gap-2">
                <Youtube className="h-4 w-4" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Blog
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="linkedin" className="mt-4">
              {linkedinPosts.length > 0 ? (
                <SocialPostsGrid posts={linkedinPosts} type="linkedin" />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Nenhum post do LinkedIn disponível.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="instagram" className="mt-4">
              {instagramPosts.length > 0 ? (
                <SocialPostsGrid posts={instagramPosts} type="instagram" />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Nenhum post do Instagram disponível.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="youtube" className="mt-4">
              {youtubeVideos.length > 0 ? (
                <SocialPostsGrid posts={youtubeVideos} type="youtube" />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Nenhum vídeo do YouTube disponível.
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="blog" className="mt-4">
              {blogPosts.length > 0 ? (
                <SocialPostsGrid posts={blogPosts} type="blog" />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    Nenhum post do blog disponível.
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ==================== GLASSDOOR TAB ==================== */}
        <TabsContent value="glassdoor" className="mt-6">
          {glassdoor?.overall_rating ? (
            <div className="space-y-6">
              {/* Avaliação Geral */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    Avaliação Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8 flex-wrap">
                    <div>
                      <div className="text-5xl font-bold">{glassdoor.overall_rating}</div>
                      <p className="text-sm text-muted-foreground mt-1">de 5.0</p>
                    </div>
                    {glassdoor.recommend_to_friend && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-3xl font-bold text-green-600">{Math.round(glassdoor.recommend_to_friend * 100)}%</div>
                        <p className="text-sm text-muted-foreground">recomendam para amigos</p>
                      </div>
                    )}
                    {glassdoor.ceo_rating !== undefined && glassdoor.ceo_rating !== null && glassdoor.ceo_rating > 0 && (
                      <div className="flex-1 min-w-[120px]">
                        <div className="text-3xl font-bold text-blue-600">{Math.round(Number(glassdoor.ceo_rating) * 100)}%</div>
                        <p className="text-sm text-muted-foreground">aprovam CEO</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ratings por Categoria */}
              <Card>
                <CardHeader>
                  <CardTitle>Avaliações por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {glassdoor.culture_values_rating && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Cultura & Valores</span>
                          <span className="text-sm font-bold">{glassdoor.culture_values_rating}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(glassdoor.culture_values_rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {glassdoor.work_life_balance_rating && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Equilíbrio Vida-Trabalho</span>
                          <span className="text-sm font-bold">{glassdoor.work_life_balance_rating}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(glassdoor.work_life_balance_rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {glassdoor.career_opportunities_rating && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Oportunidades de Carreira</span>
                          <span className="text-sm font-bold">{glassdoor.career_opportunities_rating}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(glassdoor.career_opportunities_rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {glassdoor.compensation_benefits_rating && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Compensação & Benefícios</span>
                          <span className="text-sm font-bold">{glassdoor.compensation_benefits_rating}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(glassdoor.compensation_benefits_rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {glassdoor.diversity_inclusion_rating && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Diversidade & Inclusão</span>
                          <span className="text-sm font-bold">{glassdoor.diversity_inclusion_rating}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(glassdoor.diversity_inclusion_rating / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição de Avaliações */}
              {glassdoor.rating_distribution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Avaliações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const key = stars === 1 ? 'one_star' : stars === 2 ? 'two_stars' : stars === 3 ? 'three_stars' : stars === 4 ? 'four_stars' : 'five_stars';
                        const count = glassdoor.rating_distribution[key] || 0;
                        const total = (glassdoor.rating_distribution.one_star || 0) + 
                                     (glassdoor.rating_distribution.two_stars || 0) + 
                                     (glassdoor.rating_distribution.three_stars || 0) + 
                                     (glassdoor.rating_distribution.four_stars || 0) + 
                                     (glassdoor.rating_distribution.five_stars || 0);
                        const percentage = total > 0 ? (count / total) * 100 : 0;
                        
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="w-12 text-sm font-medium flex items-center gap-1">
                              {stars} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            </span>
                            <div className="flex-1 bg-muted rounded-full h-3">
                              <div 
                                className="bg-yellow-400 h-3 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-12 text-sm text-muted-foreground text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Prós e Contras */}
              {(glassdoor.pros_example || glassdoor.cons_example || glassdoor.advice_example) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {glassdoor.pros_example && (
                    <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-700 dark:text-green-400">Prós</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-green-800 dark:text-green-300">{glassdoor.pros_example}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {glassdoor.cons_example && (
                    <Card className="border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-700 dark:text-red-400">Contras</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-red-800 dark:text-red-300">{glassdoor.cons_example}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {glassdoor.advice_example && (
                    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-700 dark:text-blue-400">Conselho à Gestão</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-800 dark:text-blue-300">{glassdoor.advice_example}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma informação do Glassdoor disponível.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== MERCADO TAB ==================== */}
        <TabsContent value="mercado" className="mt-6 space-y-6">
          {/* Análise Estratégica */}
          {strategicAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Análise Estratégica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategicAnalysis.visao_geral && (
                  <div>
                    <h4 className="font-semibold mb-2">Visão Geral</h4>
                    <p className="text-sm text-muted-foreground">{strategicAnalysis.visao_geral}</p>
                  </div>
                )}
                {strategicAnalysis.posicionamento && (
                  <div>
                    <h4 className="font-semibold mb-2">Posicionamento</h4>
                    <p className="text-sm text-muted-foreground">{strategicAnalysis.posicionamento}</p>
                  </div>
                )}
                {strategicAnalysis.dinamica_competitiva && (
                  <div>
                    <h4 className="font-semibold mb-2">Dinâmica Competitiva</h4>
                    <p className="text-sm text-muted-foreground">{strategicAnalysis.dinamica_competitiva}</p>
                  </div>
                )}
                {strategicAnalysis.insights_estrategicos && (
                  <div>
                    <h4 className="font-semibold mb-2">Insights Estratégicos</h4>
                    <p className="text-sm text-muted-foreground">{strategicAnalysis.insights_estrategicos}</p>
                  </div>
                )}
                {(strategicAnalysis.resumo_executivo || strategicAnalysis.visao_executiva_resumida) && (
                  <div>
                    <h4 className="font-semibold mb-2">Resumo Executivo</h4>
                    <p className="text-sm text-muted-foreground">{strategicAnalysis.resumo_executivo || strategicAnalysis.visao_executiva_resumida}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ações Públicas / Eventos */}
          {acoesPublicas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Ações Públicas e Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {acoesPublicas.map((event: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{event.titulo || event.title}</h4>
                            {event.tipo && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {event.tipo}
                              </Badge>
                            )}
                          </div>
                          {(event.resumo || event.summary) && (
                            <p className="text-sm text-muted-foreground">{event.resumo || event.summary}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {event.data && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.data).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {event.url && (
                              <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                                <a href={event.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Ver mais
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notícias e Novidades */}
          {newsAndActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Notícias e Novidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsAndActions.map((news: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{news.titulo || news.title}</h4>
                            {news.tipo && (
                              <Badge variant="outline" className="text-xs">
                                {news.tipo}
                              </Badge>
                            )}
                          </div>
                          {(news.resumo || news.summary) && (
                            <p className="text-sm text-muted-foreground">{news.resumo || news.summary}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {news.data && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(news.data).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {news.url && (
                              <Button variant="link" size="sm" className="p-0 h-auto text-xs" asChild>
                                <a href={news.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Ler mais
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empresas Similares */}
          {similarCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Empresas Similares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarCompanies.filter((comp: any) => comp.name).map((comp: any, idx: number) => (
                    <div key={idx} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-start gap-3">
                        {comp.logo_url ? (
                          <img 
                            src={comp.logo_url} 
                            alt={comp.name}
                            className="w-12 h-12 object-contain rounded border flex-shrink-0 bg-white"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded border flex-shrink-0 bg-muted flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{comp.name}</h4>
                          {comp.industry && (
                            <p className="text-xs text-muted-foreground truncate">{comp.industry}</p>
                          )}
                          {comp.location && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{comp.location}</span>
                            </p>
                          )}
                          {comp.url && (
                            <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-1" asChild>
                              <a href={comp.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Ver perfil
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tópicos Recorrentes */}
          {positioning.topicos_recorrentes?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tópicos Recorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {positioning.topicos_recorrentes.map((topic: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Presença Digital */}
          {(positioning.presenca_digital?.site || positioning.presenca_digital?.blog) && (
            <Card>
              <CardHeader>
                <CardTitle>Presença Digital</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {positioning.presenca_digital.site && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Website Institucional</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={positioning.presenca_digital.site} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar
                      </a>
                    </Button>
                  </div>
                )}
                {positioning.presenca_digital.blog && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Blog</span>
                    <Button variant="outline" size="sm" asChild>
                      <a href={positioning.presenca_digital.blog} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visitar
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Curiosidades */}
          {positioning.curiosidades && (
            <Card>
              <CardHeader>
                <CardTitle>Curiosidades</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{positioning.curiosidades}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
