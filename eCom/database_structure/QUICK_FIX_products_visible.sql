-- QUICK_FIX_products_visible.sql
-- Quick fix to make existing products visible
-- Run this if products are not showing after applying 09_products_extended.sql
--
-- This script:
-- 1. Approves all existing active products
-- 2. Ensures they're visible via RLS policy

begin;

-- Approve all existing active products
update public.products
set 
  status = 'approved',
  approved_at = coalesce(approved_at, now())
where 
  is_active = true
  and (status = 'draft' or status is null or status != 'approved');

-- Archive inactive products
update public.products
set status = 'archived'
where 
  is_active = false
  and (status = 'draft' or status is null);

commit;

-- Verify: This query should return your products
-- select id, name, status, is_active from public.products;
