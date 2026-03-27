# Guia do Projeto: Portal Oficial 2026

## Arquitetura de Atualização de Dados

O projeto utiliza um fluxo híbrido para garantir que as informações das entidades (concorrentes, prospects e clientes) estejam sempre atualizadas.

### 1. Atualização Manual de Notícias (Frontend-First)
Para contornar limitações de deploy em ambientes restritos, a lógica de atualização de notícias foi movida para o frontend:
- **Hook**: `src/hooks/useUpdateNews.ts`
- **Fluxo**: 
    1. O frontend chama o webhook do N8N (`/webhook/newsupdater`) diretamente.
    2. O N8N retorna um JSON com as notícias pesquisadas.
    3. O frontend processa esse JSON, formata as datas (`formatDateForSupabase`) e realiza um `upsert` na tabela correspondente (`market_news`, `prospect_market_news`, etc.).
    4. Uma notificação é criada localmente para o sistema de "sininho".

### 2. Atualização em Lote (Edge Function)
A funcionalidade de "Atualizações Automáticas" no menu Configurações utiliza uma Edge Function centralizada:
- **Função**: `supabase/functions/batch-update-sync`
- **Melhorias Recentes**:
    - **Processamento Sequencial**: As entidades são processadas uma a uma para evitar sobrecarga no N8N e garantir que a função não expire.
    - **Filtragem por Tipo**: Agora a função filtra corretamente `entity_type = 'competitor'` ao buscar na tabela de empresas, evitando misturar clientes e concorrentes.
    - **Proteção de Dados**: Implementada validação de datas e deduplicação por URL para evitar poluição no banco de dados.

## Estrutura de Tabelas de Notícias
- `market_news`: Notícias de Concorrentes (vinculadas a `companies`).
- `prospect_market_news`: Notícias de Prospects.
- `client_market_news`: Notícias de Clientes.

> [!IMPORTANT]
> Sempre que houver mudanças na estrutura do JSON retornado pelo N8N, certifique-se de atualizar o mapeamento tanto no hook `useUpdateNews.ts` quanto na Edge Function `batch-update-sync`.
