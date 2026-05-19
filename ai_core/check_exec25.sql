SELECT status, "workflowId", "startedAt", "stoppedAt" FROM execution_entity WHERE id=25;
SELECT substring(data::text, 1, 2000) FROM execution_data WHERE "executionId"=25;
