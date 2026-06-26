create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'manager',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text,
  email text,
  company text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  contact_name text,
  phone text,
  email text,
  website text,
  lead_time_days integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  brand_id uuid references public.brands (id) on delete set null,
  brand_name text,
  name text not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  supplier_name text,
  name text not null,
  brand_name text,
  model_name text,
  serial_sku text,
  quantity integer not null default 0,
  unit_price numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  brand_name text not null,
  model_name text not null,
  serial_number text,
  device_status text not null default 'client' check (device_status in ('client', 'temporary', 'own', 'deleted')),
  owner_name text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  device_id uuid references public.devices (id) on delete set null,
  customer_name text not null,
  email text,
  device_name text not null,
  serial_number text,
  project_status text not null default 'open' check (project_status in ('open', 'finished', 'canceled', 'delayed')),
  due_date date,
  estimate numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.draft_projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null,
  phone text,
  device_model text not null,
  is_temporary boolean not null default false,
  quote_status text not null default 'pending' check (quote_status in ('pending', 'awaiting-approval', 'ready')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  supplier_id uuid references public.suppliers (id) on delete set null,
  order_number text not null,
  supplier_name text,
  order_status text not null default 'expected' check (order_status in ('expected', 'received', 'missing', 'canceled')),
  expected_date date,
  amount integer not null default 1,
  total_price numeric(12, 2) not null default 0,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cashiers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  item_name text not null,
  item_type text not null default 'new' check (item_type in ('new', 'used')),
  quantity integer not null default 1,
  price numeric(12, 2) not null default 0,
  sold_at date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  cashier_id uuid references public.cashiers (id) on delete set null,
  label text not null,
  amount numeric(12, 2) not null,
  category text not null default 'sale' check (category in ('sale', 'refund', 'expense')),
  occurred_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists clients_owner_idx on public.clients (owner_user_id);
create index if not exists suppliers_owner_idx on public.suppliers (owner_user_id);
create index if not exists brands_owner_idx on public.brands (owner_user_id);
create index if not exists models_owner_idx on public.models (owner_user_id);
create index if not exists parts_owner_idx on public.parts (owner_user_id);
create index if not exists devices_owner_idx on public.devices (owner_user_id);
create index if not exists projects_owner_idx on public.projects (owner_user_id);
create index if not exists draft_projects_owner_idx on public.draft_projects (owner_user_id);
create index if not exists orders_owner_idx on public.orders (owner_user_id);
create index if not exists cashiers_owner_idx on public.cashiers (owner_user_id);
create index if not exists transactions_owner_idx on public.transactions (owner_user_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists set_suppliers_updated_at on public.suppliers;
create trigger set_suppliers_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

drop trigger if exists set_models_updated_at on public.models;
create trigger set_models_updated_at
before update on public.models
for each row execute function public.set_updated_at();

drop trigger if exists set_parts_updated_at on public.parts;
create trigger set_parts_updated_at
before update on public.parts
for each row execute function public.set_updated_at();

drop trigger if exists set_devices_updated_at on public.devices;
create trigger set_devices_updated_at
before update on public.devices
for each row execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists set_draft_projects_updated_at on public.draft_projects;
create trigger set_draft_projects_updated_at
before update on public.draft_projects
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_cashiers_updated_at on public.cashiers;
create trigger set_cashiers_updated_at
before update on public.cashiers
for each row execute function public.set_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.suppliers enable row level security;
alter table public.brands enable row level security;
alter table public.models enable row level security;
alter table public.parts enable row level security;
alter table public.devices enable row level security;
alter table public.projects enable row level security;
alter table public.draft_projects enable row level security;
alter table public.orders enable row level security;
alter table public.cashiers enable row level security;
alter table public.transactions enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists clients_select_own on public.clients;
create policy clients_select_own on public.clients
for select using (auth.uid() = owner_user_id);

drop policy if exists clients_insert_own on public.clients;
create policy clients_insert_own on public.clients
for insert with check (auth.uid() = owner_user_id);

drop policy if exists clients_update_own on public.clients;
create policy clients_update_own on public.clients
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists clients_delete_own on public.clients;
create policy clients_delete_own on public.clients
for delete using (auth.uid() = owner_user_id);

drop policy if exists suppliers_select_own on public.suppliers;
create policy suppliers_select_own on public.suppliers
for select using (auth.uid() = owner_user_id);

drop policy if exists suppliers_insert_own on public.suppliers;
create policy suppliers_insert_own on public.suppliers
for insert with check (auth.uid() = owner_user_id);

drop policy if exists suppliers_update_own on public.suppliers;
create policy suppliers_update_own on public.suppliers
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists suppliers_delete_own on public.suppliers;
create policy suppliers_delete_own on public.suppliers
for delete using (auth.uid() = owner_user_id);

drop policy if exists brands_select_own on public.brands;
create policy brands_select_own on public.brands
for select using (auth.uid() = owner_user_id);

drop policy if exists brands_insert_own on public.brands;
create policy brands_insert_own on public.brands
for insert with check (auth.uid() = owner_user_id);

drop policy if exists brands_update_own on public.brands;
create policy brands_update_own on public.brands
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists brands_delete_own on public.brands;
create policy brands_delete_own on public.brands
for delete using (auth.uid() = owner_user_id);

drop policy if exists models_select_own on public.models;
create policy models_select_own on public.models
for select using (auth.uid() = owner_user_id);

drop policy if exists models_insert_own on public.models;
create policy models_insert_own on public.models
for insert with check (auth.uid() = owner_user_id);

drop policy if exists models_update_own on public.models;
create policy models_update_own on public.models
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists models_delete_own on public.models;
create policy models_delete_own on public.models
for delete using (auth.uid() = owner_user_id);

drop policy if exists parts_select_own on public.parts;
create policy parts_select_own on public.parts
for select using (auth.uid() = owner_user_id);

drop policy if exists parts_insert_own on public.parts;
create policy parts_insert_own on public.parts
for insert with check (auth.uid() = owner_user_id);

drop policy if exists parts_update_own on public.parts;
create policy parts_update_own on public.parts
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists parts_delete_own on public.parts;
create policy parts_delete_own on public.parts
for delete using (auth.uid() = owner_user_id);

drop policy if exists devices_select_own on public.devices;
create policy devices_select_own on public.devices
for select using (auth.uid() = owner_user_id);

drop policy if exists devices_insert_own on public.devices;
create policy devices_insert_own on public.devices
for insert with check (auth.uid() = owner_user_id);

drop policy if exists devices_update_own on public.devices;
create policy devices_update_own on public.devices
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists devices_delete_own on public.devices;
create policy devices_delete_own on public.devices
for delete using (auth.uid() = owner_user_id);

drop policy if exists projects_select_own on public.projects;
create policy projects_select_own on public.projects
for select using (auth.uid() = owner_user_id);

drop policy if exists projects_insert_own on public.projects;
create policy projects_insert_own on public.projects
for insert with check (auth.uid() = owner_user_id);

drop policy if exists projects_update_own on public.projects;
create policy projects_update_own on public.projects
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists projects_delete_own on public.projects;
create policy projects_delete_own on public.projects
for delete using (auth.uid() = owner_user_id);

drop policy if exists draft_projects_select_own on public.draft_projects;
create policy draft_projects_select_own on public.draft_projects
for select using (auth.uid() = owner_user_id);

drop policy if exists draft_projects_insert_own on public.draft_projects;
create policy draft_projects_insert_own on public.draft_projects
for insert with check (auth.uid() = owner_user_id);

drop policy if exists draft_projects_update_own on public.draft_projects;
create policy draft_projects_update_own on public.draft_projects
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists draft_projects_delete_own on public.draft_projects;
create policy draft_projects_delete_own on public.draft_projects
for delete using (auth.uid() = owner_user_id);

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
for select using (auth.uid() = owner_user_id);

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own on public.orders
for insert with check (auth.uid() = owner_user_id);

drop policy if exists orders_update_own on public.orders;
create policy orders_update_own on public.orders
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists orders_delete_own on public.orders;
create policy orders_delete_own on public.orders
for delete using (auth.uid() = owner_user_id);

drop policy if exists cashiers_select_own on public.cashiers;
create policy cashiers_select_own on public.cashiers
for select using (auth.uid() = owner_user_id);

drop policy if exists cashiers_insert_own on public.cashiers;
create policy cashiers_insert_own on public.cashiers
for insert with check (auth.uid() = owner_user_id);

drop policy if exists cashiers_update_own on public.cashiers;
create policy cashiers_update_own on public.cashiers
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists cashiers_delete_own on public.cashiers;
create policy cashiers_delete_own on public.cashiers
for delete using (auth.uid() = owner_user_id);

drop policy if exists transactions_select_own on public.transactions;
create policy transactions_select_own on public.transactions
for select using (auth.uid() = owner_user_id);

drop policy if exists transactions_insert_own on public.transactions;
create policy transactions_insert_own on public.transactions
for insert with check (auth.uid() = owner_user_id);

drop policy if exists transactions_update_own on public.transactions;
create policy transactions_update_own on public.transactions
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists transactions_delete_own on public.transactions;
create policy transactions_delete_own on public.transactions
for delete using (auth.uid() = owner_user_id);