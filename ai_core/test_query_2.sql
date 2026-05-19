SELECT "executionId", substring("data"::text, 1, 3000) AS data FROM execution_data ORDER BY "executionId" DESC LIMIT 1;
