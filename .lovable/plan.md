
# Correcoes e Complementos na Documentacao do Projeto Orbi

## Resumo das Lacunas Encontradas

Apos auditoria completa cruzando os 4 arquivos de documentacao com o codigo-fonte e banco de dados, foram identificadas 13 lacunas que precisam ser corrigidas.

---

## Correcoes no PRD.md

### 1. Documentar role legacy "administrador"
O AuthContext (`src/contexts/AuthContext.tsx` linha 9) define o tipo de Profile com `role: 'administrador' | 'executivo' | 'marketing' | 'comercial'`, mas o enum `user_role` no banco so tem `marketing | comercial | executivo`. O valor `administrador` e um resquicio de uma versao anterior. Adicionar nota sobre isso na secao de Personas.

### 2. Documentar limite de analises simultaneas
O `AnalysisContext.tsx` define `MAX_CONCURRENT_ANALYSES = 300`. Adicionar isso na secao 4.4 Analise Inteligente.

---

## Correcoes no SPECS.md

### 3. Corrigir contagem de tabelas: 53 para 54
O banco possui 54 tabelas, nao 53. A tabela `similar_companies` (standalone, com `company_id`) nao esta documentada. Ela e diferente de `company_competitors`.

### 4. Adicionar schema da tabela `notifications`
Colunas: id (uuid), user_id (uuid), title (text), message (text), type (text, default 'info'), read (boolean, default false), action_url (text, nullable), action_data (jsonb, nullable), created_at (timestamptz).

### 5. Adicionar schema da tabela `success_cases`
Colunas faltantes: client_id, client_name, client_logo_url, case_title, categories (text[]), challenges (jsonb), solutions (jsonb), results (jsonb), is_sap_published (boolean), is_video_case (boolean), video_url, pdf_url, published_by, user_id.

### 6. Adicionar schema da tabela `pending_analyses`
Colunas: id, user_id, domain, entity_type, status (default 'analyzing'), message, progress (default 0), started_at, updated_at.

### 7. Adicionar schema da tabela `update_settings`
Colunas: id, user_id, is_enabled, frequency_minutes (default 10080 = 7 dias), last_update_at, next_update_at, update_competitors (default true), update_prospects (default true), update_clients (default true), update_type (default 'full').

### 8. Adicionar schema da tabela `update_logs`
Colunas: id, user_id, started_at, completed_at, total_entities, entities_updated, status, error_message, entity_types (text[]), current_entity_name, current_entity_domain, update_type, trigger_type.

### 9. Documentar coluna `receive_email_updates` no profiles
A tabela profiles tem uma coluna booleana `receive_email_updates` (default false) que controla se o usuario optou por receber emails de atualizacao no registro.

### 10. Documentar tabela `similar_companies`
Tabela standalone (diferente de `company_competitors`): id, company_id, name, industry, location, url, logo_url, source (default 'linkedin_similar'), created_at.

### 11. Documentar Realtime
O hook `useNotifications.ts` usa Supabase Realtime com `postgres_changes` no canal `notifications-channel` para receber notificacoes em tempo real. Porem, a tabela `notifications` atualmente NAO esta na publicacao `supabase_realtime`, o que significa que o realtime pode nao funcionar. Documentar isso como "configuracao pendente".

### 12. Documentar Types de Webhook (src/types/database.ts)
O arquivo contem 30+ interfaces TypeScript que definem o formato do payload enviado/recebido do webhook N8N: WebhookData, WebhookOverview, WebhookRedesSociais, WebhookLinkedIn, WebhookInstagram, WebhookYouTube, WebhookGlassdoor, WebhookMercado, etc. Documentar como referencia para integracao com N8N.

---

## Correcoes no GUIDE.md

### 13. Alerta sobre Realtime nao configurado
Adicionar na secao "Problemas Conhecidos" que a tabela `notifications` precisa ser adicionada ao `supabase_realtime` para notificacoes em tempo real funcionarem:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## Implementacao

Todos os 4 arquivos serao atualizados em paralelo com as correcoes identificadas. As mudancas sao incrementais (adicoes e correcoes pontuais), sem reescrever o conteudo existente que esta correto.
