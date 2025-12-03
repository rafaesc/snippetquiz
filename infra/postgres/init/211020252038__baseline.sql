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







CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

