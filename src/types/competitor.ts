export interface Competitor {
  id: string;
  domain: string;
  name: string | null;
  sector: string | null;
  industry: string | null;
  employees: number | null;
  employee_count: number | null;
  location: string | null;
  hq_location: string | null;
  headquarters: string | null;
  company_type: string | null;
  founded_year: number | null;
  year_founded: number | null;
  site: string | null;
  website: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  glassdoor_rating: number | null;
  glassdoor_reviews: number | null;
  collected_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SocialChannel {
  url: string | null;
  seguidores: number | null;
}

export interface ContentItem {
  tipo: string | null;
  titulo: string | null;
  fonte: string | null;
  data: string | null;
  url: string | null;
  resumo: string | null;
}

export interface CompetitorItem {
  nome: string;
  setor: string | null;
  funcionarios: number | string | null;
  localizacao: string | null;
  site: string | null;
}

export interface QuestionAnswer {
  pergunta: string;
  resposta: string | null;
}

export interface Product {
  nome: string;
  descricao?: string | null;
}

export interface PricingInfo {
  modelo?: string | null;
  faixas?: string[] | null;
}

export interface JobListing {
  titulo: string;
  departamento?: string | null;
  local?: string | null;
  url?: string | null;
}

export interface ChangelogEntry {
  data?: string | null;
  descricao?: string | null;
}

export interface DocumentationItem {
  titulo?: string | null;
  url?: string | null;
}

export interface CustomerCase {
  cliente?: string | null;
  descricao?: string | null;
  url?: string | null;
}

export interface Review {
  fonte?: string | null;
  rating?: number | null;
  texto?: string | null;
}

export interface Flat {
  input_url: string | null;
  input_queried_at: string | null;
  nome: string | null;
  site: string | null;
  setor: string | null;
  industria: string | null;
  localizacao: string | null;
  fundacao_ano: number | null;
  tipo: string | null;
  funcionarios: number | string | null;
  linkedin: string | null;
  logo: string | null;
  banner: string | null;
  descricao_curta: string | null;
  resumo_geral: string | null;
  receita_anual: string | null;
  concorrentes: CompetitorItem[];
  conteudo_recente: ContentItem[];
  paa: QuestionAnswer[];
  glassdoor_url: string | null;
  glassdoor_rating: number | null;
  glassdoor_reviews: number | null;
  glassdoor_recommend_percent: number | null;
  glassdoor_ceo_approval: number | null;
  glassdoor_principais_aspectos: string | null;
  canais_oficiais: {
    linkedin: SocialChannel | null;
    youtube: SocialChannel | null;
    instagram: SocialChannel | null;
    facebook: SocialChannel | null;
    tiktok: SocialChannel | null;
  };
  about_urls: string[];
  rss_urls: string[];
  produtos_servicos: Product[];
  pricing: PricingInfo | null;
  vagas: JobListing[];
  changelog: ChangelogEntry[];
  status: { operational?: boolean; url?: string | null } | null;
  documentacao: DocumentationItem[];
  cases_clientes: CustomerCase[];
  avaliacoes_terceiros: Review[];
  consultas_relacionadas: string[];
  mencoes_recentes: string[];
  observacoes: string[];
  partners?: string[];
  clients_mentioned?: string[];
}

export interface Leader {
  nome: string | null;
  cargo: string | null;
  linkedin: string | null;
  email: string | null;
  telefone: string | null;
}

export interface NewsUpdate {
  titulo: string | null;
  data: string | null;
  fonte: string | null;
  url: string | null;
  resumo: string | null;
}

export interface BlogPost {
  titulo: string | null;
  data: string | null;
  url: string | null;
  resumo: string | null;
}

export interface WebhookResponse {
  data?: unknown;
  flat?: Flat;
  output?: string;
  lideranca?: Leader[];
  contatos?: {
    email_geral: string | null;
    telefone_geral: string | null;
    endereco: string | null;
  };
  noticias?: NewsUpdate[];
  blog?: BlogPost[];
  relatorio?: {
    markdown: string | null;
  };
  competitive_analysis?: {
    actions: Array<{
      competitor: string;
      actions: string[];
      funnel_stage: string[];
    }>;
    opportunities: string[];
    recommendations: string[];
  };
  briefings?: {
    company: string | null;
    industry: string | null;
    financial: string | null;
    news: string | null;
  };
  company?: {
    name: string | null;
    domain: string | null;
    description: string | null;
    company_type: string | null;
    industry: string | null;
    founded_year: string | null;
    hq: string | null;
    employees: string | null;
    website: string | null;
    logo_url: string | null;
    banner_url: string | null;
    products_services: string[];
    differentiators: string[];
    partners: string[];
    clients_mentioned: string[];
    sources: string[];
    revenue_estimate: string | null;
  };
  decision_makers?: Array<{
    name: string | null;
    title: string | null;
    source: string | null;
  }>;
  contacts?: {
    emails: string[];
    phones: string[];
    website: string | null;
    sources: string[];
    address?: string | null;
  };
  social_profiles?: Array<{
    platform: string | null;
    handle_or_url: string | null;
    followers: number | null;
    last_checked: string | null;
  }>;
  blog_posts?: Array<{
    title: string | null;
    url: string | null;
    date: string | null;
    summary: string | null;
    source: string | null;
  }>;
  glassdoor?: {
    rating: number | null;
    reviews_count: number | null;
    url: string | null;
    last_checked: string | null;
  };
  news?: Array<{
    title: string | null;
    url: string | null;
    date: string | null;
    summary: string | null;
    source: string | null;
  }>;
  competitors?: Array<{
    name: string | null;
    source: string | null;
  }>;
  acoes_recentes?: Array<{
    action: string | null;
    title?: string | null;
    url?: string | null;
    source: string | null;
    date: string | null;
    relevance_score?: number | null;
  }>;
  report?: {
    format: string;
    markdown: string;
  };
  references?: string[];
}
