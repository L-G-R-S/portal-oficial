# SPECS - Orbi: Especificações Técnicas

## 1. STACK TECNOLÓGICA

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite
- **Linguagem:** TypeScript
- **UI Library:** shadcn/ui (50+ componentes)
- **CSS:** Tailwind CSS + tailwindcss-animate
- **State Management:** TanStack React Query v5
- **Forms:** React Hook Form + Zod (validação)
- **Routing:** React Router DOM v6
- **Charts:** Recharts v2
- **PDF Generation:** jsPDF v3 + jspdf-autotable v5
- **PDF Parsing:** pdfjs-dist v4
- **Tema:** next-themes v0.3
- **Icons:** Lucide React v0.462
- **Toasts:** Sonner v1.7

### Backend
- **Plataforma:** Lovable Cloud (Supabase PostgreSQL + Edge Functions Deno)
- **Autenticação:** Supabase Auth (email/senha, sem auto-confirm)
- **Database:** PostgreSQL com RLS (Row Level Security)
- **Edge Functions:** Deno runtime (12 functions)
- **Storage:** Supabase Storage (4 buckets)

### Integrações Externas
- **Email:** Brevo API (emails transacionais)
- **IA:** OpenAI API (chat contextual via edge function)
- **Automação:** N8N (webhooks externos para coleta de dados)

---

## 2. SECRETS NECESSÁRIOS

| Secret | Descrição | Origem |
|--------|-----------|--------|
| `BREVO_API_KEY` | API key do Brevo para envio de emails | Painel Brevo |
| `OPENAI_API_KEY` | API key da OpenAI para chat IA | Painel OpenAI |
| `LOVABLE_API_KEY` | Auto-gerado pelo Lovable | Automático |
| `SUPABASE_URL` | URL do projeto Supabase | Automático |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | Automático |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase | Automático |
| `SUPABASE_DB_URL` | URL direta do banco PostgreSQL | Automático |
| `SUPABASE_PUBLISHABLE_KEY` | Chave pública do Supabase | Automático |

---

## 3. WEBHOOK URLs (N8N)

```
Análise Principal:     https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficial
Atualização Notícias:  https://n8n.srv1043934.hstgr.cloud/webhook-test/atualizar
```

---

## 4. ARQUITETURA DO BANCO DE DADOS

### 4.1 Padrão de Entidades

Cada tipo de entidade segue a mesma estrutura de tabela principal + 8 sub-tabelas:

```
┌─────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────────────┐
│ CONCORRENTES        │ PROSPECTS                │ CLIENTES                 │ EMPRESA PRIMÁRIA                 │
├─────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ companies           │ prospects                │ clients                  │ primary_company                  │
│ glassdoor_summary   │ prospect_glassdoor_sum.  │ client_glassdoor_sum.    │ primary_company_glassdoor        │
│ linkedin_posts      │ prospect_linkedin_posts  │ client_linkedin_posts    │ primary_company_linkedin_posts   │
│ instagram_posts     │ prospect_instagram_posts │ client_instagram_posts   │ primary_company_instagram_posts  │
│ youtube_videos      │ prospect_youtube_videos  │ client_youtube_videos    │ primary_company_youtube_videos   │
│ market_news         │ prospect_market_news     │ client_market_news       │ primary_company_market_news      │
│ market_research     │ prospect_market_research │ client_market_research   │ primary_company_market_research  │
│ company_leadership  │ prospect_leadership      │ client_leadership        │ primary_company_leadership       │
│ company_competitors │ prospect_similar_comp.   │ client_similar_comp.     │ primary_company_similar_comp.    │
└─────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

**Total: 36 tabelas de entidade** (4 tipos × 9 tabelas cada)

### 4.2 Tabelas de Sistema

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `profiles` | Dados do perfil do usuário (full_name, role, email, avatar_url, **receive_email_updates**) | user_id = auth.uid() |
| `user_roles` | Role do app (super_admin \| user) | super_admin only |
| `notifications` | Notificações em tempo real | user_id = auth.uid() |
| `chat_messages` | Histórico de mensagens do chat IA | user_id = auth.uid() |
| `knowledge_documents` | Documentos da base de conhecimento | user_id = auth.uid() |
| `email_subscribers` | Lista de subscribers para alertas | super_admin + own user |
| `email_alert_settings` | Configurações de alertas por email | super_admin only |
| `email_logs` | Logs de envio de emails | super_admin only |
| `update_settings` | Configurações de atualização automática | super_admin only |
| `update_logs` | Logs de atualizações em lote | authenticated |
| `analysis_activity_log` | Log detalhado de cada análise | user_id = auth.uid() |
| `analysis_jobs` | Jobs assíncronos de análise | user_id = auth.uid() |
| `pending_analyses` | Análises em andamento | user_id = auth.uid() |
| `excluded_news` | Notícias excluídas/ignoradas | super_admin only |
| `success_cases` | Cases de sucesso de clientes | authenticated |
| `case_categories` | Categorias de cases | user_id = auth.uid() |
| `similar_companies` | Empresas similares standalone (diferente de company_competitors) | authenticated |
| `competitors` | Tabela legacy (dados antigos) | authenticated |

**Total geral: 54 tabelas**

### 4.2.1 Schema das Tabelas de Sistema Detalhadas

#### `notifications`
```
id (uuid PK), user_id (uuid), title (text), message (text),
type (text, default 'info'), read (boolean, default false),
action_url (text, nullable), action_data (jsonb, nullable),
created_at (timestamptz)
```
**Nota:** O hook `useNotifications.ts` usa Supabase Realtime (`postgres_changes` no canal `notifications-channel`), porém a tabela **NÃO está** na publicação `supabase_realtime`. Realtime pode não funcionar até ser configurado.

#### `success_cases`
```
id (uuid PK), user_id (uuid), client_id (uuid, nullable), client_name (text),
client_logo_url (text, nullable), case_title (text), categories (text[]),
challenges (jsonb), solutions (jsonb), results (jsonb),
is_sap_published (boolean, default false), is_video_case (boolean, default false),
video_url (text, nullable), pdf_url (text, nullable),
published_by (text, nullable), created_at (timestamptz), updated_at (timestamptz)
```

#### `pending_analyses`
```
id (uuid PK), user_id (uuid), domain (text), entity_type (text),
status (text, default 'analyzing'), message (text, nullable),
progress (integer, default 0), started_at (timestamptz), updated_at (timestamptz)
```

#### `update_settings`
```
id (uuid PK), user_id (uuid), is_enabled (boolean, default false),
frequency_minutes (integer, default 10080 = 7 dias),
last_update_at (timestamptz), next_update_at (timestamptz),
update_competitors (boolean, default true), update_prospects (boolean, default true),
update_clients (boolean, default true), update_type (text, default 'full'),
created_at (timestamptz), updated_at (timestamptz)
```

#### `update_logs`
```
id (uuid PK), user_id (uuid), started_at (timestamptz), completed_at (timestamptz),
total_entities (integer), entities_updated (integer), status (text),
error_message (text, nullable), entity_types (text[]),
current_entity_name (text, nullable), current_entity_domain (text, nullable),
update_type (text), trigger_type (text), created_at (timestamptz)
```

#### `similar_companies` (standalone)
```
id (uuid PK), company_id (uuid FK → companies), name (text), industry (text),
location (text), url (text), logo_url (text),
source (text, default 'linkedin_similar'), created_at (timestamptz)
```
**Nota:** Diferente de `company_competitors` que armazena concorrentes identificados com evidência e website.

#### `profiles` - coluna adicional
```
receive_email_updates (boolean, default false) — controla se o usuário optou
por receber emails de atualização no momento do registro
```

### 4.3 Enums

```sql
-- Tipos de app_role
CREATE TYPE app_role AS ENUM ('super_admin', 'user');

-- Tipos de user_role (no profiles)
-- Valores: 'marketing', 'comercial', 'executivo'
```

### 4.4 Database Functions

| Função | Tipo | Descrição |
|--------|------|-----------|
| `get_current_user_role()` | SQL STABLE | Retorna role do perfil do usuário atual |
| `handle_new_user()` | TRIGGER | Cria profile automaticamente ao registrar |
| `handle_new_user_role()` | TRIGGER | Atribui role (super_admin para email específico, user para demais) |
| `has_role(uuid, app_role)` | SQL STABLE | Verifica se usuário tem determinada role |
| `is_super_admin(uuid)` | SQL STABLE | Verifica se é super_admin |
| `owns_primary_company(uuid)` | SQL STABLE | Verifica se o usuário é dono da primary_company |
| `update_companies_updated_at()` | TRIGGER | Atualiza updated_at automaticamente |
| `update_competitors_updated_at()` | TRIGGER | Atualiza updated_at automaticamente |
| `update_profiles_updated_at()` | TRIGGER | Atualiza updated_at automaticamente |
| `update_updated_at_column()` | TRIGGER | Trigger genérico de updated_at |

### 4.5 Colunas Padrão de Entidade

Cada tabela principal de entidade (companies, prospects, clients, primary_company) possui:

```
Dados Gerais: name, domain, website, description, industry, sector, type, size, market,
              headquarters, address, all_locations (jsonb), phone, tagline, cover_url,
              logo_url, year_founded, employee_count, business_model

LinkedIn:     linkedin_url, linkedin_followers, linkedin_tagline, linkedin_industry,
              linkedin_specialties (text[])

Instagram:    instagram_url, instagram_username, instagram_bio, instagram_profile_picture,
              instagram_followers, instagram_follows, instagram_posts_count

YouTube:      youtube_url, youtube_channel_name, youtube_subscribers,
              youtube_total_videos, youtube_total_views

TikTok:       tiktok_url (existe mas não implementado)

Relacionados: products_services (jsonb), differentiators (jsonb), clients (jsonb),
              partners (jsonb)

Audit:        created_at, updated_at
```

**primary_company** tem adicionalmente: `user_id` (referência ao dono) e `analyzed_at`

### 4.6 Storage Buckets

| Bucket | Público | Uso |
|--------|---------|-----|
| `avatars` | Sim | Fotos de perfil dos usuários |
| `chat-uploads` | Não | Arquivos enviados no chat IA |
| `post-media` | Sim | Thumbnails cacheadas de posts sociais |
| `case-assets` | Sim | PDFs e assets de cases de sucesso |

---

## 5. EDGE FUNCTIONS (12)

### 5.1 `ai-chat`
- **Propósito:** Chat IA contextual com OpenAI
- **Auth:** JWT do usuário
- **Secret:** `OPENAI_API_KEY`
- **Contexto:** Dados da entidade atual + empresa primária + base de conhecimento + todas empresas monitoradas
- **Input:** `{ message, entityId?, entityType?, history[] }`
- **Output:** `{ response }`

### 5.2 `process-company-data`
- **Propósito:** Processa payload completo do webhook N8N e salva dados em todas sub-tabelas
- **Auth:** Service role (chamada interna)
- **Tamanho:** ~739 linhas
- **Input:** Payload completo do N8N com dados de LinkedIn, Instagram, YouTube, Glassdoor, notícias, liderança, pesquisa de mercado
- **Lógica:** Upsert na tabela principal + delete e re-insert em cada sub-tabela

### 5.3 `send-email-alert`
- **Propósito:** Envia alerta instantâneo via Brevo
- **Secret:** `BREVO_API_KEY`
- **Remetente:** `luguilherme07@gmail.com` (nome: "Orbi - Notícias")
- **Filtro:** Envia apenas para subscribers ativos com `receive_instant_alerts = true`

### 5.4 `send-digest-email`
- **Propósito:** Envia digest semanal consolidado
- **Secret:** `BREVO_API_KEY`
- **Conteúdo:** Resumo de notícias recentes de todas as entidades

### 5.5 `batch-update`
- **Propósito:** Inicia atualização em lote de entidades
- **Fluxo:** Busca todas entidades → envia domínio de cada uma para webhook N8N

### 5.6 `batch-update-sync`
- **Propósito:** Processamento síncrono de atualizações em lote

### 5.7 `check-auto-updates`
- **Propósito:** Verifica se há atualizações automáticas agendadas para executar
- **Uso:** Chamado periodicamente (cron)

### 5.8 `cache-post-images`
- **Propósito:** Cacheia thumbnails de posts do Instagram (que expiram)
- **Storage:** Salva no bucket `post-media`

### 5.9 `extract-case-pdf`
- **Propósito:** Extrai texto de PDFs de cases de sucesso
- **Output:** Texto extraído para busca e exibição

### 5.10 `update-news`
- **Propósito:** Atualiza notícias de mercado via webhook N8N
- **Webhook:** `https://n8n.srv1043934.hstgr.cloud/webhook-test/atualizar`

### 5.11 `delete-user`
- **Propósito:** Remove usuário do sistema completamente
- **Auth:** Super admin only
- **Ação:** Remove do auth + profile + user_roles

### 5.12 `voice-to-text`
- **Propósito:** Transcrição de áudio para texto
- **Uso:** Integrado ao chat IA

---

## 6. DESIGN SYSTEM

### 6.1 Cores (CSS Variables HSL)

#### Light Mode
```css
:root {
  --background: 0 0% 100%;           /* #ffffff */
  --foreground: 220 38% 8%;          /* #0d111d - Azul escuro */
  --primary: 23 100% 56%;            /* #ff751f - Laranja */
  --primary-foreground: 0 0% 100%;   /* #ffffff */
  --secondary: 220 38% 8%;           /* #0d111d - Azul escuro */
  --secondary-foreground: 0 0% 100%; /* #ffffff */
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 40%;
  --accent: 0 0% 96%;
  --accent-foreground: 220 38% 8%;
  --destructive: 0 84% 60%;
  --border: 0 0% 90%;
  --input: 0 0% 90%;
  --ring: 23 100% 56%;               /* Laranja */
  --radius: 0.5rem;
  
  /* Sidebar */
  --sidebar-background: 220 38% 8%;  /* Azul escuro */
  --sidebar-foreground: 0 0% 100%;
  --sidebar-primary: 23 100% 56%;
  --sidebar-accent: 220 38% 12%;
  --sidebar-border: 220 38% 15%;
}
```

#### Dark Mode
```css
.dark {
  --background: 220 38% 8%;          /* Azul escuro como fundo */
  --foreground: 0 0% 100%;
  --card: 220 38% 12%;
  --secondary: 220 38% 20%;
  --muted: 220 38% 15%;
  --muted-foreground: 0 0% 70%;
  --border: 220 38% 20%;
  --input: 220 38% 20%;
}
```

### 6.2 Cores de Entidade (para gráficos e badges)

```typescript
// src/lib/colors.ts
ENTITY_COLORS = {
  primary:    'hsl(25, 95%, 53%)',      // Laranja - Sua empresa
  competitor: 'hsl(210, 100%, 50%)',    // Azul - Concorrentes
  prospect:   'hsl(45, 93%, 47%)',      // Âmbar - Prospects
  client:     'hsl(142, 71%, 45%)',     // Verde - Clientes
}

SOCIAL_COLORS = {
  linkedin:  'hsl(210, 100%, 50%)',
  instagram: 'hsl(340, 80%, 55%)',
  youtube:   'hsl(0, 100%, 50%)',
}
```

### 6.3 Cores de Email (Brevo templates)
```typescript
PRIME_COLOR = '#131A2A'      // Background principal
PRIME_COLOR_DARK = '#0d111d' // Background mais escuro
```

### 6.4 Tipografia
- **Font Family:** `'Titillium Web', sans-serif`
- Configurada via `tailwind.config.ts` → `fontFamily.sans`
- Importada via Google Fonts no `index.html`

### 6.5 Componentes shadcn/ui Utilizados
accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip

---

## 7. ESTRUTURA DE PASTAS

```
src/
├── App.tsx                    # Router principal com todas as rotas
├── App.css                    # Estilos globais adicionais
├── index.css                  # CSS variables (design system)
├── main.tsx                   # Entry point
├── vite-env.d.ts              # Types do Vite
│
├── components/
│   ├── ui/                    # shadcn/ui primitives (50+ componentes)
│   ├── dashboard/             # Componentes do dashboard
│   │   ├── CompanyHero.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── MarketSummary.tsx
│   │   ├── SocialComparisonChart.tsx
│   │   ├── GlassdoorComparison.tsx
│   │   ├── EntityRankingTable.tsx
│   │   ├── NewsFeed.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickInsights.tsx
│   ├── entity/                # Componentes de entidade genéricos
│   │   ├── UnifiedEntityCard.tsx
│   │   ├── EntityListPage.tsx
│   │   ├── EntityDetailContent.tsx
│   │   └── tabs/
│   │       ├── OverviewTab.tsx
│   │       ├── RedesSociaisTab.tsx
│   │       ├── GlassdoorTab.tsx
│   │       └── MercadoTab.tsx
│   ├── cases/                 # Cases de sucesso
│   │   ├── CaseCard.tsx
│   │   ├── CaseFilters.tsx
│   │   └── NewCaseDialog.tsx
│   ├── chat/                  # Chat IA
│   │   ├── ChatWindow.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── FloatingChatButton.tsx
│   │   └── InlineChat.tsx
│   ├── competitor/            # Componentes de análise
│   │   ├── AnalysisProgressBanner.tsx
│   │   ├── CompanyHeader.tsx
│   │   ├── GlassdoorCard.tsx
│   │   ├── LeadershipList.tsx
│   │   └── SocialMetricsCards.tsx
│   ├── settings/              # Componentes de configuração
│   │   ├── AutoUpdateCard.tsx
│   │   ├── AutoUpdateSettings.tsx
│   │   ├── EmailAlertsCard.tsx
│   │   ├── KnowledgeBaseSettings.tsx
│   │   ├── PrimaryCompanySettings.tsx
│   │   ├── PrimaryCompanySettingsReadOnly.tsx
│   │   └── UserManagementCard.tsx
│   ├── AppSidebar.tsx
│   ├── Layout.tsx
│   ├── MetricCard.tsx
│   ├── NotificationBell.tsx
│   ├── PrivateRoute.tsx
│   ├── SocialPostsGrid.tsx
│   ├── SuperAdminOnly.tsx
│   └── UnderConstruction.tsx
│
├── contexts/
│   ├── AuthContext.tsx         # Autenticação, perfil, roles
│   ├── NotificationContext.tsx # Notificações em tempo real
│   └── AnalysisContext.tsx     # Estado de análises em andamento
│
├── hooks/                     # 20+ custom hooks
│   ├── useAIChat.ts
│   ├── useActivityLogs.ts
│   ├── useCases.ts
│   ├── useDashboardData.ts
│   ├── useEmailAlertSettings.ts
│   ├── useEmailPreview.ts
│   ├── useEmailSubscribers.ts
│   ├── useEntities.ts         # Hook central para todas entidades
│   ├── useEntityDetail.ts
│   ├── useKnowledgeBase.ts
│   ├── useNotifications.ts
│   ├── usePrimaryCompany.ts
│   ├── useProfile.ts
│   ├── useSaveCompetitor.ts
│   ├── useUpdateNews.ts
│   ├── useUpdateSettings.ts
│   ├── useUserManagement.ts
│   ├── useUserRole.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── pages/                     # 25+ páginas
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Competitors.tsx
│   ├── CompetitorsSalvos.tsx
│   ├── CompetitorDetail.tsx
│   ├── AnaliseInteligente.tsx
│   ├── AnaliseResultados.tsx
│   ├── ProspectsList.tsx
│   ├── ProspectDetail.tsx
│   ├── AnaliseProspect.tsx
│   ├── ClientsList.tsx
│   ├── ClientDetail.tsx
│   ├── AnaliseCliente.tsx
│   ├── PrimaryCompanyDetail.tsx
│   ├── Cases.tsx
│   ├── CaseDetail.tsx
│   ├── Settings.tsx
│   ├── Logs.tsx
│   ├── KnowledgeBase.tsx
│   ├── UserManagement.tsx
│   ├── EmailAlerts.tsx
│   ├── AutoUpdates.tsx
│   ├── Events.tsx
│   ├── PrimeExperience.tsx
│   ├── Prospecting.tsx
│   └── NotFound.tsx
│
├── types/
│   ├── database.ts            # 30+ interfaces TypeScript (webhook payloads N8N)
│   │                          # WebhookData, WebhookOverview, WebhookRedesSociais,
│   │                          # WebhookLinkedIn, WebhookInstagram, WebhookYouTube,
│   │                          # WebhookGlassdoor, WebhookMercado, etc.
│   │                          # Referência obrigatória para integração com N8N
│   └── competitor.ts          # Types de concorrentes
│
├── utils/
│   ├── casePdfGenerator.ts    # Gerador PDF de cases
│   ├── pdfReportGenerator.ts  # Gerador PDF de relatórios
│   ├── logReportGenerator.ts  # Gerador PDF de logs
│   ├── pdfToImage.ts          # Conversão PDF → imagem
│   ├── helpers.ts             # Funções utilitárias gerais
│   ├── validation.ts          # Validações de formulário
│   └── youtube.ts             # Utilitários do YouTube
│
├── lib/
│   ├── colors.ts              # Cores de entidades e social
│   ├── constants.ts           # URLs de webhooks e rotas
│   ├── formatters.ts          # Formatadores de dados
│   └── utils.ts               # cn() e utilidades do Tailwind
│
└── integrations/
    └── supabase/
        ├── client.ts          # Cliente Supabase (auto-gerado)
        └── types.ts           # Types do banco (auto-gerado, 3490 linhas)

supabase/
├── config.toml                # Configuração do Supabase
└── functions/                 # 12 Edge Functions
    ├── ai-chat/index.ts
    ├── batch-update/index.ts
    ├── batch-update-sync/index.ts
    ├── cache-post-images/index.ts
    ├── check-auto-updates/index.ts
    ├── delete-user/index.ts
    ├── extract-case-pdf/index.ts
    ├── process-company-data/index.ts
    ├── send-digest-email/index.ts
    ├── send-email-alert/index.ts
    ├── update-news/index.ts
    └── voice-to-text/index.ts
```

---

## 8. ROTAS DA APLICAÇÃO

Todas as rotas (exceto auth) são protegidas via `<PrivateRoute>` e renderizadas dentro de `<Layout>`.

| Rota | Componente | Acesso |
|------|-----------|--------|
| `/login` | Login | Público |
| `/register` | Register | Público |
| `/forgot-password` | ForgotPassword | Público |
| `/reset-password` | ResetPassword | Público |
| `/` | Dashboard | Autenticado |
| `/competitors` | Competitors | Autenticado |
| `/concorrentes/salvos` | CompetitorsSalvos | Autenticado |
| `/competitor/:id` | CompetitorDetail | Autenticado |
| `/analise-inteligente` | AnaliseInteligente | Autenticado |
| `/analise-resultados` | AnaliseResultados | Autenticado |
| `/prospects` | ProspectsList | Autenticado |
| `/prospect/:id` | ProspectDetail | Autenticado |
| `/analise-prospect` | AnaliseProspect | Autenticado |
| `/clientes` | ClientsList | Autenticado |
| `/client/:id` | ClientDetail | Autenticado |
| `/analise-cliente` | AnaliseCliente | Autenticado |
| `/primary-company/:id` | PrimaryCompanyDetail | Autenticado |
| `/cases` | Cases | Autenticado |
| `/cases/:id` | CaseDetail | Autenticado |
| `/settings` | Settings | Autenticado |
| `/logs` | Logs | Autenticado |
| `/knowledge-base` | KnowledgeBase | Autenticado |
| `/user-management` | UserManagement | Super Admin |
| `/email-alerts` | EmailAlerts | Super Admin |
| `/auto-updates` | AutoUpdates | Super Admin |
| `/events` | Events | Autenticado |
| `/prime-experience` | PrimeExperience | Autenticado |
| `/prospecting` | Prospecting | Autenticado |
| `*` | NotFound | Autenticado |

---

## 9. RLS POLICIES (Resumo)

### Entidades compartilhadas (companies, prospects, clients + sub-tabelas)
```sql
-- SELECT, INSERT, DELETE: auth.role() = 'authenticated'
-- UPDATE: apenas tabelas principais (companies, clients, prospects)
```

### Primary Company (por usuário)
```sql
-- Filtrado por owns_primary_company(id) que verifica user_id = auth.uid()
```

### Dados pessoais (chat_messages, knowledge_documents, case_categories)
```sql
-- CRUD: auth.uid() = user_id
```

### Admin only (email_alert_settings, email_subscribers, excluded_news, email_logs)
```sql
-- Acesso via is_super_admin()
-- email_subscribers: super_admin full + user manage own
```

### Service role policies
```sql
-- Algumas tabelas têm INSERT com WITH CHECK (true) para edge functions
-- Ex: glassdoor_summary, company_leadership, linkedin_posts, instagram_posts, market_news
```

---

## 10. PADRÃO DE EDGE FUNCTIONS

Todas seguem este template:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente com service_role para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ... lógica da function

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```
