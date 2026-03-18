// Types for database entities and webhook data

export interface Company {
  id?: string;
  domain: string;
  name: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  sector: string | null;
  headquarters: string | null;
  size: string | null;
  type: string | null;
  employee_count: number | null;
  year_founded: number | null;
  logo_url: string | null;
  cover_url: string | null;
  tagline: string | null;
  address: string | null;
  phone: string | null;
  market: string | null;
  business_model: string | null;
  products_services: string[] | null;
  differentiators: string[] | null;
  partners: string[] | null;
  clients: ClientInfo[] | null;
  all_locations: string[] | null;
  linkedin_url: string | null;
  linkedin_followers: number | null;
  linkedin_industry: string | null;
  linkedin_specialties: string[] | null;
  linkedin_tagline: string | null;
  instagram_url: string | null;
  instagram_username: string | null;
  instagram_followers: number | null;
  instagram_follows: number | null;
  instagram_posts_count: number | null;
  instagram_bio: string | null;
  instagram_profile_picture: string | null;
  youtube_url: string | null;
  youtube_channel_name: string | null;
  youtube_subscribers: number | null;
  youtube_total_views: number | null;
  youtube_total_videos: number | null;
}

export interface ClientInfo {
  nome: string;
  case_url?: string;
  observacao?: string;
}

export interface GlassdoorData {
  company_id: string;
  overall_rating: number | null;
  compensation_benefits_rating: number | null;
  culture_values_rating: number | null;
  career_opportunities_rating: number | null;
  work_life_balance_rating: number | null;
  diversity_inclusion_rating: number | null;
  recommend_to_friend: number | null;
  ceo_rating: number | null;
  ratings_one_star: number | null;
  ratings_two_stars: number | null;
  ratings_three_stars: number | null;
  ratings_four_stars: number | null;
  ratings_five_stars: number | null;
  pros_example: string | null;
  cons_example: string | null;
  advice_example: string | null;
  reviews: GlassdoorReview[] | null;
  salaries: GlassdoorSalary[] | null;
  benefits: string[] | null;
  interviews: GlassdoorInterview[] | null;
}

export interface GlassdoorReview {
  rating: number;
  title: string;
  pros: string;
  cons: string;
  date: string;
}

export interface GlassdoorSalary {
  job_title: string;
  salary_range: string;
  average: number;
}

export interface GlassdoorInterview {
  position: string;
  experience: string;
  difficulty: string;
  date: string;
}

export interface LeaderData {
  company_id: string;
  name: string | null;
  position: string | null;
  linkedin_url: string | null;
  source: string | null;
  decision_level: string | null;
  relevance_score: number | null;
}

export interface SocialPost {
  id: string;
  company_id: string;
  external_id: string | null;
  url: string | null;
  created_at: string | null;
}

export interface LinkedInPost extends SocialPost {
  text: string | null;
  post_type: string | null;
  posted_at: string | null;
  total_reactions: number;
  likes: number;
  loves: number;
  celebrates: number;
  reposts: number;
  comments: number;
  media_type: string | null;
  media_url: string | null;
  media_thumbnail: string | null;
  media_duration_ms: number | null;
}

export interface InstagramPost extends SocialPost {
  caption: string | null;
  media_type: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number | null;
  timestamp: string | null;
  mentions: string | null;
  hashtags: string | null;
}

export interface YouTubeVideo extends SocialPost {
  title: string | null;
  thumbnail_url: string | null;
  view_count: number;
  likes: number;
  comments_count: number;
  published_at: string | null;
}

export interface MarketNews {
  id?: string;
  company_id: string;
  title: string | null;
  url: string | null;
  date: string | null;
  summary: string | null;
  classification: string | null;
}

export interface SimilarCompany {
  id?: string;
  company_id: string;
  name: string | null;
  industry: string | null;
  location: string | null;
  url: string | null;
  logo_url: string | null;
  source: string | null;
}

export interface DigitalPresence {
  site_institucional?: string;
  blog?: string;
  materiais?: string[];
  eventos?: string[];
}

export interface PublicAction {
  titulo: string;
  url: string;
  data: string;
  resumo: string;
  tipo: string;
}

export interface StrategicAnalysis {
  visao_geral?: string;
  posicionamento?: string;
  dinamica_competitiva?: string;
  insights_estrategicos?: string;
  visao_executiva_resumida?: string;
}

export interface SwotAnalysis {
  pontos_fortes?: string[];
  pontos_fracos?: string[];
  oportunidades?: string[];
  ameacas?: string[];
}

export interface MarketResearch {
  company_id: string;
  central_message: string | null;
  topics_discussed: string | null;
  overall_analysis: string | null;
  source_references: string | null;
  institutional_discourse: string | null;
  positioning_discourse: string | null;
  recurring_topics: string[] | null;
  institutional_curiosities: string[] | null;
  digital_presence: DigitalPresence | null;
  public_actions: PublicAction[] | null;
  events: MarketEvent[] | null;
  website_url: string | null;
  blog_url: string | null;
  strategic_analysis: StrategicAnalysis | null;
  swot_analysis: SwotAnalysis | null;
}

export interface MarketEvent {
  titulo: string;
  data: string;
  url?: string;
  descricao?: string;
}

// Webhook response types
export interface WebhookPositioning {
  discurso_institucional?: string;
  topicos_recorrentes?: string[];
  presenca_digital?: DigitalPresence;
  acoes_publicas?: PublicAction[];
}

export interface WebhookOverview {
  nome?: string;
  setor?: string;
  descricao_institucional?: string;
  dominio?: string;
  logo_url?: string;
  endereco?: string;
  telefone?: string;
  produtos_servicos?: string[];
  mercado_alvo?: string;
  modelo_negocio?: string;
  diferenciais?: string[];
  parceiros?: string[];
  clientes_citados?: ClientInfo[];
  curiosidades_institucionais?: string[];
  lideranca?: WebhookLeader[];
  positioning?: WebhookPositioning;
  similar_companies?: WebhookSimilarCompany[];
  overall_analysis?: StrategicAnalysis;
  references?: string[];
}

export interface WebhookLeader {
  nome: string;
  cargo: string;
  linkedin?: string;
  url_fonte?: string;
}

export interface WebhookSimilarCompany {
  name: string;
  industry?: string;
  location?: string;
  url?: string;
  logo_url?: string;
}

export interface WebhookLinkedIn {
  url?: string;
  followers?: number;
  company_size?: string;
  employee_count?: number;
  headquarters?: string;
  founded?: string;
  specialties?: string[];
  posts?: WebhookLinkedInPost[];
}

export interface WebhookLinkedInPost {
  id: string;
  text?: string;
  post_type?: string;
  posted_at?: string;
  stats?: {
    total_reactions?: number;
    like?: number;
    love?: number;
    celebrate?: number;
    reposts?: number;
    comments?: number;
  };
  media?: {
    type?: string;
    url?: string;
    thumbnail?: string;
    duration?: number;
  };
}

export interface WebhookInstagram {
  username?: string;
  profileUrl?: string;
  profile?: {
    followersCount?: number;
    followsCount?: number;
    postsCount?: number;
  };
  posts?: WebhookInstagramPost[];
}

export interface WebhookInstagramPost {
  id: string;
  caption?: string;
  url?: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  mentions?: string[];
  hashtags?: string[];
  timestamp?: string;
}

export interface WebhookYouTube {
  channel_url?: string;
  subscriber_count?: number;
  videos?: WebhookYouTubeVideo[];
}

export interface WebhookYouTubeVideo {
  title?: string;
  description?: string;
  url?: string;
  published_at?: string;
  views?: number;
  likes?: number;
  comments?: number;
  thumbnail?: string;
}

export interface WebhookGlassdoor {
  rating?: number;
  reviews?: GlassdoorReview[];
  salaries?: GlassdoorSalary[];
  benefits?: string[];
  interviews?: GlassdoorInterview[];
}

export interface WebhookRedesSociais {
  linkedin?: WebhookLinkedIn;
  instagram?: WebhookInstagram;
  youtube?: WebhookYouTube;
  glassdoor?: WebhookGlassdoor;
}

export interface WebhookMercado {
  news_and_actions?: PublicAction[];
  eventos?: MarketEvent[];
  similar_companies?: WebhookSimilarCompany[];
  analises?: SwotAnalysis;
}

export interface WebhookData {
  overview?: WebhookOverview;
  redes_sociais?: WebhookRedesSociais;
  mercado?: WebhookMercado;
}