# Prime Vision - Plataforma de Inteligência de Mercado

Plataforma de inteligência de mercado de alto desempenho projetada para centralizar o monitoramento de empresas, análises estratégicas, performance digital e engajamento. Esta solução SaaS nível produto integra um frontend reativo moderno com um backend descentralizado via Supabase Edge Functions e n8n.

## 🚀 Tecnologias

- **Frontend**: React + Vite (TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management & Data Fetching**: React Hooks, Context API
- **Backend & Database**: Supabase (PostgreSQL, Row Level Security, Edge Functions)
- **Integrações de Dados**: Pipelines n8n + Webhooks
- **UI/UX**: Componentes responsivos Radix UI
- **Formulários e Validação**: React Hook Form + Zod

## 🏗️ Estrutura do Projeto

O projeto adota uma arquitetura limpa e padrão da indústria (Separation of Concerns):

```
/src
 ├── /components  # Componentes reutilizáveis (UI e domínio)
 ├── /contexts    # Provedores de estado global (Auth, Analysis)
 ├── /hooks       # Regras de negócio, fetch de dados e chamadas externas (Supabase)
 ├── /pages       # Telas da aplicação e sistema de roteamento
 ├── /lib         # Configurações genéricas, formatadores e instâncias globais
 ├── /utils       # Funções de auxílio de negócio e dados puros
 └── /types       # Definições base do TypeScript
```

## ⚙️ Pré-requisitos & Instalação

Assegure-se de que possui o [Node.js](https://nodejs.org/) (versão >=18 recomendada) e o gerenciador de pacotes `npm` instalados.

1. **Clone o repositório** e acesse a raiz do projeto.
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Configure as variáveis de ambiente**:
   - Faça uma cópia de `.env.example` nomeando como `.env` na raiz do projeto.
   - Preencha os valores de `VITE_SUPABASE_PROJECT_ID` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
   - Mantenha `.env` **restritamente local** (nunca commite chaves privadas `SERVICE_ROLE` do Supabase aqui).

4. **Inicie o ambiente de desenvolvimento**:
   ```bash
   npm run dev
   ```
   Acesse a aplicação operando localmente via [http://localhost:5173](http://localhost:5173).

## 🗄️ Integração e Banco de Dados (Supabase)

O frontend assina as chaves publicas do projeto configuradas via env. Todas as lógicas invasivas, modificações em lote e ingestões das _pipelines_ do N8N correm em background e são processadas pelas **Edge Functions** (`/supabase/functions/`), utilizando o modelo Seguro-pelo-Design via Bypass Role ou Server Keys encriptadas internamente na plataforma do Supabase.

> [!IMPORTANT]
> A segurança da exposição de dados é definida ao nível do banco (RLS). Nunca subverta a proteção das tabelas públicas exceto para processos de autenticação explícitos.

## 📦 Build e Deploy (Produção)

Este projeto foi otimizado estruturalmente para deploy contínuo em plataformas modernas na Edge, como a **Vercel** ou **Netlify**.

1. **Faça o build estático** da aplicação:
   ```bash
   npm run build
   ```
   *Se este comando terminar sem erros e criar a pasta `/dist`, o projeto está seguro e limpo (códigos mortos e arquivos irrelevantes não bloqueiam a pipeline).*

2. **Na plataforma de CI/CD (ex: Vercel)**:
   - Configure o comando de Build: `npm run build`
   - Diretório de Output: `dist`
   - Comandos de instalação: `npm ci`
   - **Crucial**: Crie todos os registros correspondentes ao seu `.env` diretamente no painel Secrets da Vercel.

---
_Projetado para escala. Nível SaaS._
