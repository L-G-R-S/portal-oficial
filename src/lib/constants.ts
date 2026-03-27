export const WEBHOOK_URL = "https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficial";
export const ROUTES = {
  KNOWLEDGE_BASE: '/knowledge-base',
  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  
  // Main
  DASHBOARD: "/",
  SETTINGS: "/settings",
  LOGS: "/logs",
  USER_MANAGEMENT: "/user-management",
  EMAIL_ALERTS: "/email-alerts",
  AUTO_UPDATES: "/auto-updates",
  FEEDBACKS: "/feedbacks",
  
  // Competitors
  COMPETITORS: "/competitors",
  COMPETITORS_SAVED: "/concorrentes/salvos",
  COMPETITOR_DETAIL: "/competitor",
  ANALISE_INTELIGENTE: "/analise-inteligente",
  ANALISE_RESULTADOS: "/analise-resultados",
  
  // Prospects
  PROSPECTS: "/prospects",
  PROSPECT_DETAIL: "/prospect",
  ANALISE_PROSPECT: "/analise-prospect",
  
  // Clients
  CLIENTS: "/clientes",
  CLIENT_DETAIL: "/client",
  ANALISE_CLIENTE: "/analise-cliente",
  
  // Primary Company
  PRIMARY_COMPANY_DETAIL: "/primary-company",
  
  // Other
  EVENTS: "/events",
  PRIME_EXPERIENCE: "/prime-experience",
  PROSPECTING: "/prospecting",
  CASES: "/cases",
} as const;
