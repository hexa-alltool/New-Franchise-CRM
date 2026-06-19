-- Run AFTER creating auth users in Supabase dashboard
-- Replace UUIDs with actual auth user IDs

-- Step 1: Create these users in Authentication > Users first:
--   superadmin@vediccrm.com  (password: Admin@123)
--   admin1@vediccrm.com      (password: Admin@123)
--   franchise1@vediccrm.com  (password: Franchise@123)

-- Step 2: Copy their UIDs and replace below

-- insert into public.profiles (id, name, email, mobile, role, city, status)
-- values
--   ('SUPER-ADMIN-UID-HERE', 'Rajesh Sharma',   'superadmin@vediccrm.com', '9876543210', 'super_admin', 'Mumbai',   'active'),
--   ('ADMIN-UID-HERE',       'Priya Mehta',     'admin1@vediccrm.com',     '9876543211', 'admin',       'Ahmedabad','active'),
--   ('FRANCHISE-UID-HERE',   'Sunita Gupta',    'franchise1@vediccrm.com', '9876543212', 'franchise',   'Vadodara', 'active');

-- insert into public.franchises (name, owner_id, admin_id, city, state, tenure_start, tenure_end, franchise_fee, franchise_status)
-- values ('Mathify Vadodara', 'FRANCHISE-UID-HERE', 'ADMIN-UID-HERE', 'Vadodara', 'Gujarat', '2025-01-01', '2026-01-01', 12000, 'active');

-- update public.profiles
-- set franchise_id = (select id from public.franchises where owner_id = 'FRANCHISE-UID-HERE'),
--     franchise_status = 'active'
-- where id = 'FRANCHISE-UID-HERE';

-- Sample resources (no UID needed)
insert into public.resources (title, description, type, file_url, is_active, access_all) values
  ('Vedic Maths Level 1', 'Beginner concepts', 'pdf', '', true, true),
  ('Multiplication tricks', 'Speed techniques', 'video', '', true, true),
  ('Level 2 PPT', 'Advanced sutras', 'ppt', '', true, true);
