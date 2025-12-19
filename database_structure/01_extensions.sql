-- 01_extensions.sql
-- Supabase / Postgres extensions needed by the platform.
--
-- This file is safe to run multiple times.

begin;

-- Required for gen_random_uuid(), digest(), etc.
create extension if not exists pgcrypto;

commit;
