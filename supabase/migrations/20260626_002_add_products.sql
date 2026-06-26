-- Products table: catalog items with images and optional client association
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  name text not null,
  description text,
  category text,
  price numeric(12, 2) not null default 0,
  quantity integer not null default 0,
  image_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists products_owner_idx on public.products (owner_user_id);
create index if not exists products_client_idx on public.products (client_id);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists products_select_own on public.products;
create policy products_select_own on public.products
for select using (auth.uid() = owner_user_id);

drop policy if exists products_insert_own on public.products;
create policy products_insert_own on public.products
for insert with check (auth.uid() = owner_user_id);

drop policy if exists products_update_own on public.products;
create policy products_update_own on public.products
for update using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

drop policy if exists products_delete_own on public.products;
create policy products_delete_own on public.products
for delete using (auth.uid() = owner_user_id);

-- ─── Supabase Storage ───────────────────────────────────────────────────────
-- Create the product-images bucket (run once; safe to re-run)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  false,
  5242880,  -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Storage RLS: authenticated users can manage their own images
-- Images are stored under product-images/{userId}/...
drop policy if exists "product_images_select_own" on storage.objects;
create policy "product_images_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "product_images_insert_own" on storage.objects;
create policy "product_images_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "product_images_update_own" on storage.objects;
create policy "product_images_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "product_images_delete_own" on storage.objects;
create policy "product_images_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
