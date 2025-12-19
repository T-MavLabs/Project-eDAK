-- 20_migrate_existing_products.sql
-- VYAPAR: Migration script to approve existing products
--
-- Run this AFTER applying 09_products_extended.sql
-- This ensures all existing active products are approved and visible
-- Safe to run multiple times.

begin;

-- Approve all existing active products that are in draft or null status
-- This makes them visible via the RLS policy
update public.products
set 
  status = 'approved',
  approved_at = coalesce(approved_at, now())
where 
  is_active = true
  and (status = 'draft' or status is null or status = 'pending_approval');

-- Archive inactive products
update public.products
set status = 'archived'
where 
  is_active = false
  and (status = 'draft' or status is null);

commit;
