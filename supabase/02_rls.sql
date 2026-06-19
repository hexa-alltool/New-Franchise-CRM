alter table public.profiles        enable row level security;
alter table public.franchises      enable row level security;
alter table public.payments        enable row level security;
alter table public.inquiries       enable row level security;
alter table public.admissions      enable row level security;
alter table public.fee_payments    enable row level security;
alter table public.resources       enable row level security;
alter table public.resource_access enable row level security;
alter table public.book_orders     enable row level security;
alter table public.notifications   enable row level security;
alter table public.audit_logs      enable row level security;

create or replace function public.current_user_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_franchise_id()
returns uuid language sql security definer stable as $$
  select franchise_id from public.profiles where id = auth.uid()
$$;

-- profiles
create policy "Own profile" on public.profiles for select using (id = auth.uid());
create policy "Super admin all profiles" on public.profiles for select using (public.current_user_role() = 'super_admin');
create policy "Super admin insert profiles" on public.profiles for insert with check (public.current_user_role() = 'super_admin');
create policy "Super admin update profiles" on public.profiles for update using (public.current_user_role() = 'super_admin');
create policy "Self update" on public.profiles for update using (id = auth.uid());

-- franchises
create policy "Super admin franchises" on public.franchises for all using (public.current_user_role() = 'super_admin');
create policy "Admin zone franchises" on public.franchises for all using (public.current_user_role() = 'admin' and admin_id = auth.uid());
create policy "Franchise own" on public.franchises for select using (public.current_user_role() = 'franchise' and id = public.current_franchise_id());

-- inquiries
create policy "Super admin inquiries" on public.inquiries for select using (public.current_user_role() = 'super_admin');
create policy "Franchise own inquiries" on public.inquiries for all using (franchise_id = public.current_franchise_id());

-- admissions
create policy "Super admin admissions" on public.admissions for select using (public.current_user_role() = 'super_admin');
create policy "Franchise own admissions" on public.admissions for all using (franchise_id = public.current_franchise_id());

-- fee_payments
create policy "Super admin fee_payments" on public.fee_payments for select using (public.current_user_role() = 'super_admin');
create policy "Franchise own fee_payments" on public.fee_payments for all using (franchise_id = public.current_franchise_id());

-- resources
create policy "Active resources" on public.resources for select using (is_active = true);
create policy "Super admin resources" on public.resources for all using (public.current_user_role() = 'super_admin');

-- payments
create policy "Super admin payments" on public.payments for all using (public.current_user_role() = 'super_admin');
create policy "Admin payments" on public.payments for all using (public.current_user_role() = 'admin');

-- book_orders
create policy "Franchise orders" on public.book_orders for all using (franchise_id = public.current_franchise_id());
create policy "Admin orders" on public.book_orders for all using (public.current_user_role() in ('super_admin','admin'));

-- notifications
create policy "Own notifications" on public.notifications for all using (user_id = auth.uid());
create policy "Insert notifications" on public.notifications for insert with check (public.current_user_role() in ('super_admin','admin'));

-- audit_logs
create policy "Super admin audit" on public.audit_logs for select using (public.current_user_role() = 'super_admin');
create policy "Insert audit" on public.audit_logs for insert with check (true);
