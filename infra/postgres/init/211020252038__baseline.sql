DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
      CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pass';
   END IF;

   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'readonly') THEN
      CREATE ROLE readonly NOLOGIN;
   END IF;
END
$$;





<<<<<<< HEAD
=======

DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_namespace WHERE nspname = 'auth'
   ) THEN
      EXECUTE 'CREATE SCHEMA auth';
   END IF;
END
$$;

GRANT USAGE ON SCHEMA auth TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

GRANT USAGE ON SCHEMA auth TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT SELECT ON TABLES TO readonly;
>>>>>>> 363c56c (feat: core service and ai processor event driven)

DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_namespace WHERE nspname = 'ai_processor'
   ) THEN
      EXECUTE 'CREATE SCHEMA ai_processor';
   END IF;
END
$$;

GRANT USAGE ON SCHEMA ai_processor TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_processor GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

GRANT USAGE ON SCHEMA ai_processor TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_processor GRANT SELECT ON TABLES TO readonly;


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

<<<<<<< HEAD
=======
\echo Initialize schema core, auth and ai_processor.
>>>>>>> 363c56c (feat: core service and ai processor event driven)
