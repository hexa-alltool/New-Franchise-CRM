create extension if not exists "uuid-ossp";

create table public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  name            text not null,
  email           text not null,
  mobile          text,
  role            text not null check (role in ('super_admin','admin','franchise')),
  city            text,
  status          text default 'active' check (status in ('active','suspended','inactive')),
  admin_id        uuid references public.profiles(id),
  franchise_id    uuid,
  franchise_status text default 'active',
  created_at      timestamptz default now(),
  last_login      timestamptz
);

create table public.franchises (
  id               uuid default uuid_generate_v4() primary key,
  name             text not null,
  owner_id         uuid references public.profiles(id),
  admin_id         uuid references public.profiles(id),
  address          text,
  city             text,
  state            text,
  pincode          text,
  mobile           text,
  email            text,
  tenure_start     date,
  tenure_end       date,
  franchise_fee    numeric(10,2) default 0,
  franchise_status text default 'active' check (franchise_status in ('active','expired','suspended','pending')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table public.payments (
  id              uuid default uuid_generate_v4() primary key,
  franchise_id    uuid references public.franchises(id) on delete cascade,
  amount          numeric(10,2) not null,
  payment_date    date not null,
  payment_mode    text default 'bank_transfer',
  transaction_ref text,
  notes           text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now()
);

create table public.inquiries (
  id              uuid default uuid_generate_v4() primary key,
  franchise_id    uuid references public.franchises(id) on delete cascade,
  child_name      text not null,
  child_age       int,
  child_class     text,
  school_name     text,
  parent_name     text not null,
  parent_mobile   text not null,
  parent_email    text,
  city            text,
  address         text,
  course_type     text default 'full' check (course_type in ('full','short')),
  lead_source     text default 'walk_in',
  lead_status     text default 'follow_up' check (lead_status in ('follow_up','highly_interested','not_interested','converted')),
  follow_up_date  date,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table public.admissions (
  id               uuid default uuid_generate_v4() primary key,
  franchise_id     uuid references public.franchises(id) on delete cascade,
  student_id       text unique not null,
  inquiry_id       uuid references public.inquiries(id),
  child_name       text not null,
  child_dob        date,
  child_photo_url  text,
  school_name      text,
  class_grade      text,
  parent_name      text not null,
  parent_mobile    text not null,
  parent_email     text,
  address          text,
  city             text,
  emergency_contact text,
  course_type      text default 'full',
  total_fees       numeric(10,2) default 0,
  paid_fees        numeric(10,2) default 0,
  admission_date   date default current_date,
  remarks          text,
  created_at       timestamptz default now()
);

create table public.fee_payments (
  id             uuid default uuid_generate_v4() primary key,
  admission_id   uuid references public.admissions(id) on delete cascade,
  franchise_id   uuid references public.franchises(id),
  amount         numeric(10,2) not null,
  payment_date   date default current_date,
  payment_mode   text default 'cash',
  receipt_no     text,
  created_at     timestamptz default now()
);

create table public.resources (
  id             uuid default uuid_generate_v4() primary key,
  title          text not null,
  description    text,
  type           text check (type in ('video','pdf','ppt')),
  file_url       text,
  thumbnail_url  text,
  is_active      boolean default true,
  access_all     boolean default true,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz default now()
);

create table public.resource_access (
  resource_id  uuid references public.resources(id) on delete cascade,
  franchise_id uuid references public.franchises(id) on delete cascade,
  primary key (resource_id, franchise_id)
);

create table public.book_orders (
  id               uuid default uuid_generate_v4() primary key,
  franchise_id     uuid references public.franchises(id) on delete cascade,
  order_type       text check (order_type in ('full_set','short_course','practice')),
  quantity         int not null,
  delivery_address text,
  required_by      date,
  status           text default 'pending' check (status in ('pending','approved','rejected','dispatched','delivered')),
  invoice_url      text,
  notes            text,
  approved_by      uuid references public.profiles(id),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table public.notifications (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id) on delete cascade,
  title      text not null,
  message    text,
  type       text check (type in ('payment','renewal','resource','order','system')),
  is_read    boolean default false,
  created_at timestamptz default now()
);

create table public.audit_logs (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references public.profiles(id),
  table_name text not null,
  record_id  uuid,
  action     text check (action in ('insert','update','delete')),
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz default now()
);

create index on public.franchises(admin_id);
create index on public.franchises(franchise_status);
create index on public.inquiries(franchise_id);
create index on public.admissions(franchise_id);
create index on public.fee_payments(admission_id);
create index on public.notifications(user_id, is_read);
