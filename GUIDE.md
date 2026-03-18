# GUIDE - Orbi: Guia de Configuração, Deploy e Testes

## 1. PRÉ-REQUISITOS

- Node.js 18+ e npm instalados
- Conta no Lovable com Cloud habilitado
- Chave de API do Brevo (para emails)
- Chave de API da OpenAI (para chat IA)
- Webhooks N8N configurados (para coleta de dados)

---

## 2. CONFIGURAÇÃO DE SECRETS

### 2.1 BREVO_API_KEY
1. Acesse https://app.brevo.com
2. Vá em **Settings → SMTP & API → API Keys**
3. Crie uma nova API key ou copie a existente
4. No Lovable: **Settings → Secrets → Add Secret**
5. Nome: `BREVO_API_KEY`, cole o valor

### 2.2 OPENAI_API_KEY
1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova API key
3. No Lovable: **Settings → Secrets → Add Secret**
4. Nome: `OPENAI_API_KEY`, cole o valor

### 2.3 Secrets Automáticos
Os seguintes secrets são configurados automaticamente pelo Lovable Cloud:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `LOVABLE_API_KEY`

---

## 3. CONFIGURAÇÃO DE WEBHOOKS N8N

### 3.1 Webhook de Análise Principal
- **URL:** `https://webhooks-659c9b8b-af7b-4ad0-b287-a844749a2bef.primecontrol.com.br/webhook/oficial`
- **Método:** POST
- **Payload enviado pelo Orbi:**
```json
{
  "domain": "empresa.com.br",
  "entityType": "competitor" | "prospect" | "client" | "primary",
  "entityId": "uuid-da-entidade",
  "callbackUrl": "https://<supabase-url>/functions/v1/process-company-data"
}
```
- **Fluxo:** Orbi envia domínio → N8N coleta dados de múltiplas fontes → N8N chama `process-company-data` com payload completo → Edge function salva dados no banco

### 3.2 Webhook de Atualização de Notícias
- **URL:** `https://n8n.srv1043934.hstgr.cloud/webhook-test/atualizar`
- **Uso:** Chamado pela edge function `update-news` para atualizar notícias de mercado

---

## 4. CONFIGURAÇÃO DE STORAGE

4 buckets devem existir (já criados automaticamente):

| Bucket | Público | Uso | Políticas |
|--------|---------|-----|-----------|
| `avatars` | ✅ | Fotos de perfil | SELECT público, INSERT/UPDATE para dono |
| `chat-uploads` | ❌ | Arquivos do chat IA | SELECT/INSERT para dono |
| `post-media` | ✅ | Cache de thumbnails | SELECT público, INSERT autenticado |
| `case-assets` | ✅ | PDFs de cases | SELECT público, INSERT autenticado |

---

## 5. CHECKLIST DE TESTES MANUAIS

### Fase 1: Login/Registro
- [ ] Acessar `/register`
- [ ] Criar conta com email + senha + nome + role
- [ ] Verificar email de confirmação recebido
- [ ] Confirmar email clicando no link
- [ ] Fazer login em `/login`
- [ ] Verificar redirecionamento para Dashboard

### Fase 2: Dashboard
- [ ] Dashboard carrega sem erros
- [ ] CompanyHero mostra empresa primária (se configurada)
- [ ] Gráficos de comparação social renderizam
- [ ] Feed de notícias mostra dados recentes
- [ ] Ranking de entidades funciona
- [ ] Sidebar navega corretamente

### Fase 3: Análise Inteligente
- [ ] Ir para `/analise-inteligente`
- [ ] Inserir domínio de uma empresa
- [ ] Verificar que o webhook N8N foi chamado
- [ ] Aguardar processamento (AnalysisProgressBanner)
- [ ] Verificar que a entidade foi criada com dados completos
- [ ] Verificar sub-tabelas: LinkedIn posts, Instagram posts, YouTube, Glassdoor, notícias, liderança

### Fase 4: Chat IA
- [ ] Clicar no botão flutuante de chat
- [ ] Enviar mensagem simples
- [ ] Verificar resposta da IA
- [ ] Abrir chat inline na página de detalhe de entidade
- [ ] Verificar que o contexto da entidade é usado na resposta
- [ ] Testar upload de arquivo/imagem

### Fase 5: Email Alerts (Super Admin)
- [ ] Ir para `/email-alerts`
- [ ] Adicionar subscriber com email válido
- [ ] Configurar alertas instantâneos
- [ ] Disparar alerta manualmente
- [ ] Verificar recebimento do email
- [ ] Verificar log em email_logs

### Fase 6: Cases de Sucesso
- [ ] Ir para `/cases`
- [ ] Criar novo case com upload de PDF
- [ ] Verificar extração de conteúdo do PDF
- [ ] Verificar listagem com filtros
- [ ] Abrir detalhe do case
- [ ] Exportar case como PDF

### Fase 7: Configurações
- [ ] Ir para `/settings`
- [ ] Editar perfil (nome, role)
- [ ] Upload de avatar
- [ ] Configurar empresa primária (super admin)
- [ ] Executar análise na empresa primária

### Fase 8: Super Admin
- [ ] Ir para `/user-management`
- [ ] Verificar lista de usuários
- [ ] Alterar role de um usuário
- [ ] Ir para `/logs`
- [ ] Verificar logs de atividade
- [ ] Ir para `/auto-updates`
- [ ] Configurar atualização automática
- [ ] Ir para `/knowledge-base`
- [ ] Upload de documento

---

## 6. COMO PUBLICAR

### Via Lovable
1. Clique em **Share** no topo do editor
2. Clique em **Publish**
3. Aguarde o build e deploy
4. O frontend ficará disponível na URL pública do Lovable
5. Edge functions e migrations são deployados automaticamente

### Domínio Customizado
1. Vá em **Project → Settings → Domains**
2. Adicione seu domínio customizado
3. Configure os registros DNS conforme instruído
4. Aguarde a propagação (pode levar até 48h)

---

## 7. PROBLEMAS CONHECIDOS E SOLUÇÕES

### Limite de 1000 rows por query
- **Problema:** Queries retornam no máximo 1000 registros por padrão
- **Solução:** Implementar paginação ou filtros mais restritivos
- **Impacto:** Pode afetar listagens muito grandes de posts ou notícias

### Thumbnails do Instagram expiram
- **Problema:** URLs de thumbnails do Instagram têm validade temporária
- **Solução:** Edge function `cache-post-images` cacheia as imagens no bucket `post-media`
- **Campo:** `cached_thumbnail_url` em todas as tabelas de Instagram posts

### Webhook timeout em análises longas
- **Problema:** Análises de empresas grandes podem demorar mais que o timeout
- **Solução:** Sistema de jobs assíncronos via tabela `analysis_jobs` com polling de status
- **Progresso:** Tabela `pending_analyses` com campos `status`, `progress`, `message`

### Dados do Glassdoor podem vir incompletos
- **Problema:** Nem todas as empresas têm página no Glassdoor
- **Solução:** Campos nullable em todas as sub-ratings, UI mostra "Sem dados" quando vazio

### Email de verificação não chega
- **Problema:** Auto-confirm está desabilitado
- **Solução:** Verificar pasta de spam. O email vem de `noreply@mail.app.supabase.io`

### RLS bloqueia dados
- **Problema:** Dados não aparecem na interface
- **Solução:** Verificar se o usuário está autenticado e se as RLS policies permitem o acesso. Edge functions usam `service_role_key` para bypass.

### Realtime de notificações não funciona
- **Problema:** A tabela `notifications` **não está** na publicação `supabase_realtime`
- **Solução:** Executar o seguinte SQL no banco:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```
- **Impacto:** Sem essa configuração, o hook `useNotifications.ts` não recebe atualizações em tempo real via `postgres_changes`
