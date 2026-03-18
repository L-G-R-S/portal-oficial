# PRD - Orbi: Portal de Inteligência Competitiva

## 1. VISÃO DO PRODUTO

Portal de Inteligência Competitiva chamado **Orbi** (anteriormente Prime Control) para monitoramento automatizado de concorrentes, prospects e clientes. O sistema coleta e analisa dados de redes sociais (LinkedIn, Instagram, YouTube), Glassdoor, notícias de mercado e liderança corporativa, oferecendo uma visão 360° do cenário competitivo.

**Proposta de Valor:** Centralizar toda a inteligência competitiva em um único dashboard, eliminando a necessidade de monitoramento manual em dezenas de fontes diferentes.

**Nome do Produto:** Orbi
**Domínio Original:** primecontrol.com.br
**Idioma:** Português Brasileiro
**Plataforma:** Web (responsivo - desktop e mobile)

---

## 2. OBJETIVOS

- Permitir monitoramento automatizado de concorrentes, prospects e clientes
- Oferecer análise comparativa visual entre a empresa primária e entidades monitoradas
- Integrar chat com IA contextual para insights rápidos
- Automatizar alertas por email sobre mudanças relevantes no mercado
- Centralizar dados de redes sociais, Glassdoor e notícias em um único portal
- Gerar relatórios PDF exportáveis
- Gerenciar cases de sucesso com extração automática de conteúdo de PDFs

---

## 3. PERSONAS E ROLES

### 3.1 Super Admin
- **Perfil:** Administrador do sistema, responsável pela configuração e gestão
- **Acesso:** Total - gerencia usuários, empresa primária, alertas por email, atualizações automáticas, base de conhecimento
- **Identificação:** Via tabela `user_roles` (role = `super_admin`)
- **Email hardcoded:** `luguilherme07@gmail.com` (atribuído automaticamente via trigger `handle_new_user_role`)

### 3.2 User - Marketing
- **Perfil:** Profissional de marketing que monitora concorrentes e tendências
- **Acesso:** Dashboard, listas de entidades, análises, chat IA, cases
- **Restrições:** Não pode alterar configurações administrativas, gerenciar usuários ou configurar alertas por email

### 3.3 User - Comercial
- **Perfil:** Profissional de vendas que acompanha prospects e clientes
- **Acesso:** Mesmo do marketing
- **Restrições:** Mesmas do marketing

### 3.4 User - Executivo
- **Perfil:** Gestão executiva que acompanha o panorama competitivo
- **Acesso:** Mesmo do marketing
- **Restrições:** Mesmas do marketing

### Controle de Acesso
- **app_role** (tabela `user_roles`): `super_admin` | `user`
- **role** (tabela `profiles`): `marketing` | `comercial` | `executivo`
- **Nota:** O `AuthContext.tsx` define o tipo Profile com `role: 'administrador' | 'executivo' | 'marketing' | 'comercial'`. O valor `administrador` é um resquício de versão anterior e **não existe** no enum `user_role` do banco. Não deve ser usado para novos usuários.
- Componente `SuperAdminOnly` controla visibilidade na UI
- Componente `PrivateRoute` protege todas as rotas autenticadas

---

## 4. FUNCIONALIDADES CORE

### 4.1 Autenticação
- Login com email e senha via Lovable Cloud
- Registro com nome, email, senha e seleção de role (marketing/comercial/executivo)
- **Sem auto-confirm** - verificação de email obrigatória
- Recuperação de senha (forgot password + reset password)
- Opção de receber atualizações por email no registro
- Perfil com upload de avatar

### 4.2 Dashboard Comparativo
Visão geral com dados da empresa primária vs entidades monitoradas:
- **CompanyHero:** Card destaque da empresa primária com logo, métricas e links
- **MarketSummary:** Resumo do mercado com total de entidades monitoradas
- **SocialComparisonChart:** Gráfico comparativo de métricas sociais (LinkedIn followers, Instagram followers, YouTube subscribers)
- **GlassdoorComparison:** Comparativo de ratings do Glassdoor entre empresas
- **EntityRankingTable:** Ranking de todas entidades por métricas (seguidores, engajamento)
- **NewsFeed:** Feed de notícias recentes de todas as entidades
- **ActivityFeed:** Log de atividades recentes (análises, atualizações)
- **QuickInsights:** Insights rápidos gerados a partir dos dados

### 4.3 Gestão de Entidades (4 tipos)

**Concorrentes (companies)**
- Lista com cards unificados mostrando métricas-chave
- Filtros e busca
- Análise Inteligente: enviar domínio → webhook N8N → processamento → dados completos
- Página de detalhe com 4 abas: Overview, Redes Sociais, Glassdoor, Mercado
- Exportação PDF de relatório completo

**Prospects (prospects)**
- Mesma estrutura de concorrentes
- Análise Inteligente dedicada para prospects
- Detalhe com as mesmas 4 abas

**Clientes (clients)**
- Mesma estrutura de concorrentes
- Análise Inteligente dedicada para clientes
- Detalhe com as mesmas 4 abas
- **Cases de Sucesso**: upload de PDF, extração automática de conteúdo, categorização, listagem e detalhe

**Empresa Primária (primary_company)**
- Uma por usuário (filtrada por `user_id`)
- Configuração via Settings (super_admin)
- Análise Inteligente para a própria empresa
- Detalhe com as mesmas 4 abas
- Dados usados como referência nos gráficos comparativos do dashboard

### 4.4 Análise Inteligente
- Usuário insere domínio da empresa
- Sistema envia para webhook N8N externo
- N8N coleta dados de múltiplas fontes (LinkedIn, Instagram, YouTube, Glassdoor, notícias, liderança)
- Edge function `process-company-data` recebe o payload e salva em todas as sub-tabelas
- Sistema de jobs assíncronos para evitar timeout
- Progresso mostrado via `AnalysisProgressBanner`
- **Limite:** Máximo de 300 análises simultâneas (`MAX_CONCURRENT_ANALYSES` em `AnalysisContext.tsx`)
- Resultado: entidade completa com todos os dados populados

### 4.5 Detalhe de Entidade (4 abas)
- **Overview:** Informações gerais, descrição, setor, tamanho, localização, diferenciadores, produtos/serviços, clientes, parceiros, empresas similares, liderança
- **Redes Sociais:** Posts do LinkedIn (com reações, comentários, reposts), posts do Instagram (com likes, comentários), vídeos do YouTube (com views, likes)
- **Glassdoor:** Rating geral, sub-ratings (cultura, remuneração, carreira, etc.), aprovação do CEO, recomendação a amigos, reviews, salários, entrevistas, benefícios
- **Mercado:** Notícias de mercado com classificação (positiva/negativa/neutra), pesquisa de mercado (discurso institucional, análise estratégica, SWOT, presença digital, eventos)

### 4.6 Chat IA Contextual
- Chat flutuante acessível de qualquer página (FloatingChatButton)
- Chat inline na página de detalhe de entidade (InlineChat)
- Alimentado pela OpenAI via edge function `ai-chat`
- **Contexto automático:** dados da entidade atual, empresa primária, base de conhecimento, todas as empresas monitoradas
- Suporte a upload de arquivos e imagens
- Histórico de conversas por usuário
- Transcrição de áudio para texto (voice-to-text)

### 4.7 Sistema de Notificações
- Notificações em tempo real via ícone de sino (NotificationBell)
- Tipos: análise concluída, nova notícia, alerta de mudança
- Marcação como lida
- Armazenadas na tabela `notifications`

### 4.8 Alertas por Email (Super Admin)
- **Brevo** como provider de email transacional
- Remetente: `luguilherme07@gmail.com` (nome: "Orbi - Notícias")
- **Alerta Instantâneo:** enviado quando uma nova análise é concluída
- **Digest Semanal:** resumo consolidado de notícias recentes
- Gerenciamento de subscribers (email, nome, filtros por tipo de entidade)
- Configuração de frequência, dia e hora do digest
- Logs de envio (email_logs)

### 4.9 Atualização Automática de Dados
- Configuração de agendamento (frequência, dia, hora)
- Batch update: envia domínios de todas entidades para webhook N8N
- Edge functions `batch-update` e `batch-update-sync` para processamento
- `check-auto-updates` verifica se há atualizações agendadas
- Logs de atualização (update_logs + analysis_activity_log)

### 4.10 Base de Conhecimento (Super Admin)
- Upload de documentos (PDF, DOCX, TXT)
- Extração automática de texto
- Resumo do conteúdo
- Documentos usados como contexto adicional no chat IA

### 4.11 Gerenciamento de Usuários (Super Admin)
- Lista de usuários com role e status
- Alterar role de usuário (super_admin/user)
- Deletar usuário via edge function `delete-user`

### 4.12 Cases de Sucesso
- Vinculados a clientes
- Upload de PDF com extração automática de conteúdo (`extract-case-pdf`)
- Categorização por categorias customizáveis
- Listagem com filtros e busca
- Página de detalhe do case
- Exportação PDF do case

### 4.13 Logs
- Log de atividades de análise (analysis_activity_log)
- Log de atualizações em lote (update_logs)
- Visualização com filtros e exportação

### 4.14 Exportação PDF
- Relatório completo de entidade (dados gerais + redes sociais + Glassdoor + mercado)
- Relatório de case de sucesso
- Relatório de logs
- Gerados via jsPDF + jspdf-autotable

---

## 5. REQUISITOS NÃO-FUNCIONAIS

- **Responsividade:** Mobile e desktop (hook `use-mobile` para detecção)
- **Idioma:** Português Brasileiro em toda a interface
- **Dark Mode:** Suportado via next-themes com toggle
- **Tipografia:** Titillium Web como fonte padrão
- **Performance:** Limite de 1000 rows por query (padrão do banco)
- **Segurança:** RLS policies em todas as tabelas, autenticação obrigatória
- **Cache:** Thumbnails de posts sociais cacheadas via `cache-post-images`

---

## 6. FORA DO ESCOPO (Decisões Tomadas)

❌ Integração direta com WhatsApp
❌ TikTok (campo existe no schema mas não foi implementado)
❌ Multi-tenancy completo (dados de entidades são compartilhados entre usuários autenticados, exceto primary_company que é por user_id)
❌ Importação/Exportação CSV
❌ Automações de email marketing (apenas alertas transacionais)
❌ Sistema de pagamentos/assinaturas
❌ Campos customizáveis nas entidades
❌ Múltiplos pipelines ou workflows

---

## 7. FLUXO DE ONBOARDING

**Passo 1:** Registro com email + senha + nome + role
**Passo 2:** Verificação de email (obrigatório)
**Passo 3:** Login → Dashboard (vazio inicialmente)
**Passo 4:** Super Admin configura empresa primária em Settings
**Passo 5:** Executar Análise Inteligente na empresa primária
**Passo 6:** Adicionar concorrentes via Análise Inteligente
**Passo 7:** Dashboard popula automaticamente com dados comparativos

---

## 8. MÉTRICAS MONITORADAS POR ENTIDADE

### Redes Sociais
- **LinkedIn:** Followers, posts (reações, comentários, reposts, celebrações, loves), tagline, especialidades, indústria
- **Instagram:** Followers, following, total de posts, posts individuais (likes, comentários, compartilhamentos, hashtags, menções), bio, foto de perfil
- **YouTube:** Subscribers, total de vídeos, total de views, vídeos individuais (views, likes, comentários)

### Glassdoor
- Rating geral, aprovação do CEO, recomendação a amigos
- Sub-ratings: Cultura/Valores, Remuneração/Benefícios, Oportunidades de Carreira, Work-Life Balance, Diversidade/Inclusão
- Reviews (prós, contras, conselhos), Salários, Entrevistas, Benefícios

### Mercado
- Notícias com classificação (positiva/negativa/neutra)
- Pesquisa de mercado: discurso institucional, posicionamento, análise estratégica, SWOT, presença digital, eventos, materiais institucionais, ações públicas

### Dados Gerais
- Nome, domínio, website, descrição, setor, indústria, tamanho, ano de fundação
- Sede, endereço, todas as localizações
- Produtos/serviços, diferenciadores, clientes, parceiros
- Liderança (nome, cargo, nível de decisão, LinkedIn, score de relevância)
- Empresas similares/concorrentes identificadas
