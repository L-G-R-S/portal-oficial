# SKILLS - Orbi: Skills para Desenvolvimento com IA

> Skills são instruções estruturadas que qualquer ferramenta de IA (Lovable, Cursor, Claude Code, etc.) deve seguir para manter consistência no desenvolvimento deste projeto.

---

## Skill 1: Arquitetura do Projeto

**Nome:** `orbi-architecture`
**Descrição:** Estrutura e padrões do projeto React + Lovable Cloud

### Instruções

```
Este projeto usa:
- React 18 + Vite + TypeScript
- shadcn/ui + Tailwind CSS para UI
- TanStack React Query v5 para state management
- React Router DOM v6 para routing
- Lovable Cloud (Supabase) para backend

PADRÕES OBRIGATÓRIOS:
1. Imports usam alias @/ para src/ (ex: import { Button } from "@/components/ui/button")
2. Componentes organizados por feature em src/components/<feature>/
3. Hooks customizados em src/hooks/use<Feature>.ts
4. Páginas em src/pages/<PageName>.tsx
5. Types em src/types/
6. Utilidades em src/utils/ e src/lib/
7. Client Supabase importado de @/integrations/supabase/client (NUNCA editar este arquivo)
8. Types do banco importados de @/integrations/supabase/types (NUNCA editar este arquivo)
9. Contextos em src/contexts/ (AuthContext, NotificationContext, AnalysisContext)
10. Constantes e URLs em src/lib/constants.ts
11. Cores de entidades em src/lib/colors.ts
12. Todas as rotas protegidas via <PrivateRoute> e renderizadas dentro de <Layout>
```

---

## Skill 2: Padrão de Entidades

**Nome:** `orbi-entity-pattern`
**Descrição:** Como o pattern de entidades (company/prospect/client/primary) funciona

### Instruções

```
O sistema tem 4 TIPOS DE ENTIDADE que seguem o MESMO padrão:
- Concorrentes → tabela: companies (FK: company_id)
- Prospects → tabela: prospects (FK: prospect_id)
- Clientes → tabela: clients (FK: client_id)
- Empresa Primária → tabela: primary_company (FK: primary_company_id)

CADA ENTIDADE TEM 8 SUB-TABELAS:
1. *_glassdoor_summary (ou glassdoor_summary para companies)
2. *_linkedin_posts (ou linkedin_posts para companies)
3. *_instagram_posts (ou instagram_posts para companies)
4. *_youtube_videos (ou youtube_videos para companies)
5. *_market_news (ou market_news para companies)
6. *_market_research (ou market_research para companies)
7. *_leadership (ou company_leadership para companies)
8. *_similar_companies (ou company_competitors para companies)

REGRA: Ao adicionar um novo tipo de entidade, DEVE criar todas as 9 tabelas (principal + 8 sub).

HOOK DE REFERÊNCIA: useEntities.ts - busca dados de companies, prospects e clients com suas sub-tabelas.

COLUNAS PADRÃO da tabela principal:
- Dados gerais: name, domain, website, description, industry, sector, type, size, market, headquarters, address, all_locations (jsonb), phone, tagline, cover_url, logo_url, year_founded, employee_count, business_model
- LinkedIn: linkedin_url, linkedin_followers, linkedin_tagline, linkedin_industry, linkedin_specialties (text[])
- Instagram: instagram_url, instagram_username, instagram_bio, instagram_profile_picture, instagram_followers, instagram_follows, instagram_posts_count
- YouTube: youtube_url, youtube_channel_name, youtube_subscribers, youtube_total_videos, youtube_total_views
- Relacionados: products_services (jsonb), differentiators (jsonb), clients (jsonb), partners (jsonb)
- Audit: created_at, updated_at

NOTA: primary_company tem campo adicional user_id e analyzed_at
```

---

## Skill 3: Edge Functions (Backend)

**Nome:** `orbi-edge-functions`
**Descrição:** Padrão de desenvolvimento de edge functions Deno

### Instruções

```
TEMPLATE OBRIGATÓRIO para toda edge function:

1. CORS HEADERS (obrigatório em toda function):
   const corsHeaders = {
     "Access-Control-Allow-Origin": "*",
     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
   };

2. HANDLER OPTIONS (primeiro check):
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }

3. AUTENTICAÇÃO:
   - Para operações do usuário: extrair JWT do header Authorization
   - Para operações admin/webhook: usar SUPABASE_SERVICE_ROLE_KEY
   - Para edge functions chamadas por webhooks: verificar secret ou aceitar sem auth

4. CLIENTE SUPABASE:
   const supabaseAdmin = createClient(
     Deno.env.get("SUPABASE_URL")!,
     Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
   );

5. TRATAMENTO DE ERRO:
   try/catch com retorno de { error: error.message } e status 500

6. RESPONSE HEADERS:
   Sempre incluir corsHeaders + "Content-Type": "application/json"

7. SECRETS DISPONÍVEIS:
   - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
   - BREVO_API_KEY (para emails via Brevo)
   - OPENAI_API_KEY (para chat IA)
   - LOVABLE_API_KEY

8. PADRÃO BREVO (email):
   Remetente: { email: "luguilherme07@gmail.com", name: "Orbi - Notícias" }
   API: POST https://api.brevo.com/v3/smtp/email
   Header: api-key: Deno.env.get("BREVO_API_KEY")

9. PADRÃO OPENAI (chat):
   API: POST https://api.openai.com/v1/chat/completions
   Header: Authorization: Bearer ${Deno.env.get("OPENAI_API_KEY")}
```

---

## Skill 4: Design System e UI/UX

**Nome:** `orbi-design-system`
**Descrição:** Cores, tipografia e padrões visuais do projeto

### Instruções

```
CORES DO TEMA (HSL em CSS variables):
- Primary (Laranja): hsl(23, 100%, 56%) = #ff751f
- Secondary (Azul Escuro): hsl(220, 38%, 8%) = #0d111d
- Background Light: hsl(0, 0%, 100%) = #ffffff
- Background Dark: hsl(220, 38%, 8%) = #0d111d

CORES DE ENTIDADE (src/lib/colors.ts):
- Sua Empresa (primary): hsl(25, 95%, 53%) - Laranja
- Concorrente (competitor): hsl(210, 100%, 50%) - Azul
- Prospect: hsl(45, 93%, 47%) - Âmbar
- Cliente (client): hsl(142, 71%, 45%) - Verde

CORES SOCIAL:
- LinkedIn: hsl(210, 100%, 50%)
- Instagram: hsl(340, 80%, 55%)
- YouTube: hsl(0, 100%, 50%)

FONT: Titillium Web (Google Fonts) - OBRIGATÓRIA em todo o projeto
Configurada em tailwind.config.ts → fontFamily.sans

COMPONENTES UI: Usar shadcn/ui SEMPRE. Nunca criar componentes custom para funcionalidades que shadcn já cobre.

TOKENS CSS: NUNCA usar cores hardcoded em componentes. Sempre usar tokens semânticos:
- bg-background, text-foreground
- bg-primary, text-primary-foreground
- bg-card, text-card-foreground
- bg-muted, text-muted-foreground
- bg-destructive, text-destructive-foreground
- bg-sidebar, text-sidebar-foreground

SIDEBAR: Background azul escuro (--sidebar-background), texto branco, primary laranja

RESPONSIVIDADE: 
- Grid padrão: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Hook use-mobile.tsx para detecção mobile
- Sidebar colapsável em mobile

DARK MODE: via next-themes, toggle no header, todas as CSS variables têm versão dark
```

---

## Skill 5: Banco de Dados e Segurança

**Nome:** `orbi-database-security`
**Descrição:** Padrões de banco de dados, RLS e segurança

### Instruções

```
REGRAS OBRIGATÓRIAS:

1. SEMPRE criar RLS policies em novas tabelas
   - Tabelas de entidade: auth.role() = 'authenticated'
   - Tabelas pessoais: auth.uid() = user_id
   - Tabelas admin: is_super_admin()

2. NUNCA usar foreign key para auth.users
   - Usar tabela profiles como referência de usuários
   - Campo user_id sem FK explícita para auth.users

3. ENUM app_role: 'super_admin' | 'user'
   - Controlado pela tabela user_roles
   - Verificação via function is_super_admin()

4. ENUM user_role (no profiles): 'marketing' | 'comercial' | 'executivo'
   - Meramente informativo, não afeta permissões

5. TRIGGERS para updated_at:
   - Toda tabela com updated_at deve ter trigger automático
   - Usar function update_updated_at_column()

6. PADRÃO DE COLUNAS:
   - id: uuid DEFAULT gen_random_uuid() PRIMARY KEY
   - created_at: timestamptz DEFAULT now()
   - updated_at: timestamptz DEFAULT now()
   - Campos jsonb com DEFAULT '[]'::jsonb ou '{}'::jsonb
   - Campos numéricos com DEFAULT 0 quando fizer sentido

7. SERVICE ROLE nas edge functions:
   - Edge functions que processam webhooks usam SUPABASE_SERVICE_ROLE_KEY
   - Isso bypassa RLS - usar com cuidado
   - Algumas tabelas têm policy extra: INSERT WITH CHECK (true) para service role

8. SUPER ADMIN hardcoded:
   - Email luguilherme07@gmail.com recebe super_admin automaticamente
   - Via trigger handle_new_user_role no auth.users
```

---

## Skill 6: Integração com APIs Externas

**Nome:** `orbi-external-apis`
**Descrição:** Padrões de integração com Brevo, OpenAI e N8N

### Instruções

```
BREVO (Email Transacional):
- Secret: BREVO_API_KEY
- API: https://api.brevo.com/v3/smtp/email
- Remetente: { email: "luguilherme07@gmail.com", name: "Orbi - Notícias" }
- Brand colors: PRIME_COLOR = '#131A2A', PRIME_COLOR_DARK = '#0d111d'
- Templates HTML inline na edge function
- Logs salvos em email_logs

OPENAI (Chat IA):
- Secret: OPENAI_API_KEY
- API: https://api.openai.com/v1/chat/completions
- Model recomendado: gpt-4o-mini (ou conforme configurado)
- Edge function: ai-chat
- Contexto: entidade + empresa primária + base de conhecimento + todas empresas
- History: últimas N mensagens do chat_messages

N8N (Webhooks):
- Webhook análise: POST para URL com { domain, entityType, entityId, callbackUrl }
- Webhook notícias: POST para URL com domínio
- Callback: N8N chama process-company-data com payload completo
- Timeout: pode ser longo, usar sistema de jobs assíncronos (analysis_jobs)
- Formato do payload: JSON com seções para linkedin, instagram, youtube, glassdoor, news, leadership, market_research, similar_companies
```

---

## Skill 7: Responsividade e Mobile

**Nome:** `orbi-responsive`
**Descrição:** Padrões de responsividade e adaptação mobile

### Instruções

```
DETECÇÃO MOBILE:
- Hook: src/hooks/use-mobile.tsx
- Breakpoint: 768px (md no Tailwind)
- Uso: const isMobile = useIsMobile()

GRID RESPONSIVO:
- Padrão: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Cards de métricas: grid-cols-2 md:grid-cols-4
- Container: max-w-7xl mx-auto px-4

SIDEBAR:
- Desktop: fixa, aberta
- Mobile: colapsável via Sheet/Drawer
- Componente: AppSidebar.tsx com SidebarProvider

TABELAS:
- Em mobile: usar scroll horizontal ou cards empilhados
- ScrollArea do shadcn para tabelas largas

FONTES:
- Títulos: text-xl md:text-2xl lg:text-3xl
- Body: text-sm md:text-base
- Labels: text-xs md:text-sm

ESPAÇAMENTO:
- Padding geral: p-4 md:p-6
- Gap entre cards: gap-4 md:gap-6
- Margin entre seções: space-y-4 md:space-y-6
```

---

## Skill 8: Testes e Debug

**Nome:** `orbi-testing-debug`
**Descrição:** Estratégias de teste e debug do projeto

### Instruções

```
DEBUG NO LOVABLE:
1. Console logs na preview (F12 ou ferramenta de logs do Lovable)
2. Network requests para verificar chamadas de API
3. Session replay para reproduzir o comportamento do usuário

PROBLEMAS COMUNS E DIAGNÓSTICO:

"Dados não aparecem":
→ Verificar se o usuário está autenticado
→ Verificar RLS policies da tabela
→ Verificar se não está batendo no limite de 1000 rows
→ Verificar console para erros de query

"Edge function retorna erro":
→ Verificar logs da edge function
→ Verificar se os secrets estão configurados
→ Verificar CORS headers
→ Verificar formato do payload

"Email não é enviado":
→ Verificar BREVO_API_KEY configurada
→ Verificar email_logs para erros
→ Verificar se subscriber está ativo
→ Verificar pasta de spam

"Análise não completa":
→ Verificar status em analysis_jobs
→ Verificar pending_analyses
→ Verificar se o webhook N8N está respondendo
→ Verificar logs de process-company-data

"Imagens quebradas":
→ Thumbnails do Instagram expiram
→ Verificar cached_thumbnail_url
→ Executar cache-post-images para cachear

PADRÃO DE LOGS:
- console.log para debug temporário
- console.error para erros que devem ser tratados
- Tabelas de log: analysis_activity_log, update_logs, email_logs

VALIDAÇÕES:
- Zod para validação de formulários
- src/utils/validation.ts para validações customizadas
- React Hook Form para controle de formulários
```

---

## Prompt Inicial para Nova IA

Ao iniciar uma nova sessão de desenvolvimento com IA, use este prompt:

```
Atue como um especialista em React + TypeScript + Supabase.

Leia os seguintes arquivos de documentação do projeto Orbi ANTES de fazer qualquer alteração:
1. PRD.md - Para entender O QUE é o projeto e suas funcionalidades
2. SPECS.md - Para entender COMO foi construído (stack, banco, edge functions, design system)
3. SKILLS.md - Para seguir os padrões de desenvolvimento

REGRAS IMPORTANTES:
- Font: Titillium Web (NUNCA usar outra)
- Cores: Usar CSS variables (--primary, --secondary, etc.), NUNCA hardcoded
- Entity colors: Orange (primary), Blue (competitor), Amber (prospect), Green (client)
- shadcn/ui para todos os componentes de UI
- RLS policies em TODA nova tabela
- CORS headers em TODA edge function
- Imports com alias @/
- Idioma da interface: Português Brasileiro

Agora, siga as instruções do usuário mantendo total consistência com o projeto existente.
```
