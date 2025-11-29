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


DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_namespace WHERE nspname = 'core'
   ) THEN
      EXECUTE 'CREATE SCHEMA core';
   END IF;
END
$$;

GRANT CONNECT ON DATABASE devdb TO app_user;
GRANT USAGE ON SCHEMA core TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

GRANT USAGE ON SCHEMA core TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA core GRANT SELECT ON TABLES TO readonly;


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

DO $$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_namespace WHERE nspname = 'ai_content_service'
   ) THEN
      EXECUTE 'CREATE SCHEMA ai_content_service';
   END IF;
END
$$;

GRANT USAGE ON SCHEMA ai_content_service TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_content_service GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

GRANT USAGE ON SCHEMA ai_content_service TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_content_service GRANT SELECT ON TABLES TO readonly;


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

\echo Initialize schema core, auth and ai_content_service.
