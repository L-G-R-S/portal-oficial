-- More thorough duplicate cleanup for market_news
-- Keep only ONE row per (company_id, url) - the one with the largest id (newest)
DELETE FROM market_news
WHERE id NOT IN (
  SELECT DISTINCT ON (company_id, LOWER(TRIM(url))) id
  FROM market_news
  WHERE url IS NOT NULL
  ORDER BY company_id, LOWER(TRIM(url)), created_at DESC
)
AND url IS NOT NULL;

-- Same for prospect_market_news
DELETE FROM prospect_market_news
WHERE id NOT IN (
  SELECT DISTINCT ON (prospect_id, LOWER(TRIM(url))) id
  FROM prospect_market_news
  WHERE url IS NOT NULL
  ORDER BY prospect_id, LOWER(TRIM(url)), created_at DESC
)
AND url IS NOT NULL;

-- Same for client_market_news
DELETE FROM client_market_news
WHERE id NOT IN (
  SELECT DISTINCT ON (client_id, LOWER(TRIM(url))) id
  FROM client_market_news
  WHERE url IS NOT NULL
  ORDER BY client_id, LOWER(TRIM(url)), created_at DESC
)
AND url IS NOT NULL;

-- Now create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS market_news_company_url_unique 
ON market_news (company_id, LOWER(TRIM(url))) 
WHERE url IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS prospect_market_news_prospect_url_unique 
ON prospect_market_news (prospect_id, LOWER(TRIM(url))) 
WHERE url IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS client_market_news_client_url_unique 
ON client_market_news (client_id, LOWER(TRIM(url))) 
WHERE url IS NOT NULL;