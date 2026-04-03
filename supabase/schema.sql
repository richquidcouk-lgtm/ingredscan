-- IngredScan Supabase Schema
-- Run this in your Supabase SQL Editor

-- Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  pro boolean default false,
  pro_expires_at timestamptz,
  scan_count_today integer default 0,
  scan_date date,
  created_at timestamptz default now()
);

-- Products table (cache)
create table if not exists products (
  barcode text primary key,
  name text,
  brand text,
  nova_score integer,
  quality_score numeric,
  nutriscore_grade text,
  ingredients text,
  additives jsonb default '[]'::jsonb,
  nutrition jsonb default '{}'::jsonb,
  image_url text,
  data_source text,
  confidence integer,
  category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Scans table
create table if not exists scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  barcode text references products(barcode) on delete cascade,
  scanned_at timestamptz default now()
);

-- Swaps table
create table if not exists swaps (
  id uuid default gen_random_uuid() primary key,
  category text,
  product_name text,
  retailer text,
  nova_score integer,
  quality_score numeric,
  price_difference text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_scans_user on scans(user_id);
create index if not exists idx_scans_barcode on scans(barcode);
create index if not exists idx_products_category on products(category);

-- RLS Policies
alter table profiles enable row level security;
alter table products enable row level security;
alter table scans enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Products: anyone can read, service role can write
create policy "Anyone can read products" on products for select to anon, authenticated using (true);
create policy "Service can insert products" on products for insert with check (true);
create policy "Service can update products" on products for update using (true);

-- Scans: users can CRUD their own
create policy "Users can view own scans" on scans for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on scans for insert with check (auth.uid() = user_id);
create policy "Users can delete own scans" on scans for delete using (auth.uid() = user_id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Daily scan count reset function (call via Supabase Edge Function or cron)
create or replace function reset_daily_scan_counts()
returns void as $$
begin
  update profiles
  set scan_count_today = 0, scan_date = current_date
  where scan_date < current_date or scan_date is null;
end;
$$ language plpgsql security definer;
