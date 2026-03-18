-- Remove duplicate similar_companies, keeping newest entry per (company_id, name)
DELETE FROM similar_companies a
USING similar_companies b
WHERE a.company_id = b.company_id 
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name))
  AND a.created_at < b.created_at;

-- Remove duplicate prospect_similar_companies, keeping newest
DELETE FROM prospect_similar_companies a
USING prospect_similar_companies b
WHERE a.prospect_id = b.prospect_id 
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name))
  AND a.created_at < b.created_at;

-- Remove duplicate client_similar_companies, keeping newest
DELETE FROM client_similar_companies a
USING client_similar_companies b
WHERE a.client_id = b.client_id 
  AND LOWER(TRIM(a.name)) = LOWER(TRIM(b.name))
  AND a.created_at < b.created_at;