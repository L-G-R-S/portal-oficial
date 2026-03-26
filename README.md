# Portal de Inteligência de Mercado (Benchmarking)

Plataforma centralizada para monitoramento de competitividade, análise de presença digital e benchmarking estratégico para a **Prime Control**.

## 🚀 Sobre o Projeto
O portal automatiza a coleta de dados de redes sociais (LinkedIn, Instagram, YouTube), Glassdoor e notícias de mercado para fornecer uma visão clara do posicionamento da Prime Control em relação aos seus concorrentes e prospects.

## 🛠️ Tecnologias Utilizadas
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage).
- **Automação**: N8N (Orquestração de coleta e inteligência artificial).

## 📋 Principais Funcionalidades
- **Dashboard Comparativo**: Métricas de seguidores e engajamento em tempo real.
- **Visão 360° por Empresa**: Detalhes institucionais, liderança, produtos e diferenciais.
- **Linha do Tempo de Redes Sociais**: Últimas postagens e vídeos integrados.
- **Monitoramento de Notícias**: Feed automatizado de ações e notícias do mercado.
- **Painel Administrativo**: Gestão de usuários, logs de atividade e configurações de atualização.

## ⚙️ Configuração para Desenvolvimento

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/L-G-R-S/portal-oficial.git
   cd portal-oficial
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env` baseado nas chaves do seu projeto Supabase.

4. **Rodar localmente**:
   ```bash
   npm run dev
   ```

## 📦 Deploy
O projeto está configurado para deploy contínuo via Vercel/Netlify e integração nativa com Supabase Edge Functions.

---
Desenvolvido por **Antigravity AI** para Prime Control.
