DO $$
BEGIN
   IF NOT EXISTS (
     SELECT 1
     FROM   information_schema.tables
     WHERE  table_schema = 'core'
       AND  table_name   = 'debezium_signals'
   ) THEN
     EXECUTE '
       CREATE TABLE core.debezium_signals (
         id   VARCHAR(255) PRIMARY KEY,
         type VARCHAR(255) NOT NULL,
         data VARCHAR(2048) NULL
       )';
   END IF;
END
$$;

GRANT INSERT ON TABLE core.debezium_signals TO debezium;