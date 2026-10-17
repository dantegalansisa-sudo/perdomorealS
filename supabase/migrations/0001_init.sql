-- Perdomo Real Estate — initial schema
-- Run in the Supabase SQL editor or with `supabase db push`.

create extension if not exists "pgcrypto";

-- ───────────────────────── Profiles & roles ─────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'));
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- New auth users get an editor profile. The very first user becomes admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, case when (select count(*) from public.profiles) = 0 then 'admin' else 'editor' end)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ───────────────────────── Settings (single row) ─────────────────────────
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '18090000000',
  whatsapp_default_message jsonb not null default '{"es":"","en":""}',
  whatsapp_project_messages jsonb not null default '{}',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  socials jsonb not null default '{}',
  hero jsonb not null default '{}',
  exchange_rates jsonb not null default '{"DOP":60,"EUR":0.92}',
  gtm_id text,
  ga4_id text,
  show_placeholder_labels boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Projects ─────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug_es text not null unique,
  slug_en text not null unique,
  name text not null,
  tagline jsonb not null default '{"es":"","en":""}',
  description jsonb not null default '{"es":"","en":""}',
  location_name text not null default '',
  zone text not null default '',
  lat double precision not null default 18.7357,
  lng double precision not null default -68.4537,
  status text not null default 'preventa' check (status in ('preventa','construccion','listo')),
  amenities text[] not null default '{}',
  timeline jsonb not null default '[]',
  payment_plans jsonb not null default '[]',
  documents jsonb not null default '[]',
  developer jsonb not null default '{}',
  distances jsonb not null default '[]',
  price_from numeric,
  delivery_date date,
  total_units int not null default 0,
  video_url text,
  tour_url text,
  brochure_url text,
  featured boolean not null default false,
  published boolean not null default false,
  is_flagship boolean not null default false,
  seo jsonb not null default '{}',
  is_placeholder boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.villa_models (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  code text not null,
  name text not null,
  bedrooms int not null default 0,
  bathrooms numeric not null default 0,
  built_m2 numeric not null default 0,
  lot_m2 numeric not null default 0,
  price_from numeric,
  description jsonb not null default '{"es":"","en":""}',
  features jsonb not null default '[]',
  sort int not null default 0,
  is_placeholder boolean not null default false
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  model_id uuid references public.villa_models(id) on delete set null,
  code text not null,
  lot_number int not null,
  status text not null default 'available' check (status in ('available','reserved','sold')),
  price numeric,
  lot_m2 numeric,
  built_m2 numeric,
  is_placeholder boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (project_id, lot_number)
);

-- ───────────────────────── Properties ─────────────────────────
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug_es text not null unique,
  slug_en text not null unique,
  title jsonb not null default '{"es":"","en":""}',
  description jsonb not null default '{"es":"","en":""}',
  type text not null check (type in ('villa','apartment','house','land')),
  zone text not null default '',
  project_id uuid references public.projects(id) on delete set null,
  price numeric,
  bedrooms int not null default 0,
  bathrooms numeric not null default 0,
  built_m2 numeric not null default 0,
  lot_m2 numeric not null default 0,
  status text not null default 'listo' check (status in ('preventa','construccion','listo')),
  amenities text[] not null default '{}',
  lat double precision not null default 18.6,
  lng double precision not null default -68.4,
  badges text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  video_url text,
  tour_url text,
  seo jsonb not null default '{}',
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────────────────────── Media ─────────────────────────
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('project','property','post','model')),
  owner_id uuid not null,
  url text not null,
  path text,
  alt jsonb not null default '{"es":"","en":""}',
  sort int not null default 0,
  is_cover boolean not null default false,
  kind text not null default 'image' check (kind in ('image','floorplan')),
  width int,
  height int,
  created_at timestamptz not null default now()
);
create index if not exists media_owner_idx on public.media (owner_type, owner_id, sort);

-- ───────────────────────── Blog & FAQ ─────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug_es text not null unique,
  slug_en text not null unique,
  title jsonb not null default '{"es":"","en":""}',
  excerpt jsonb not null default '{"es":"","en":""}',
  content jsonb not null default '{"es":"","en":""}',
  category text not null default 'guias',
  cover_url text,
  author text not null default 'Perdomo Real Estate',
  published boolean not null default false,
  published_at timestamptz not null default now(),
  seo jsonb not null default '{}',
  is_placeholder boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  question jsonb not null default '{"es":"","en":""}',
  answer jsonb not null default '{"es":"","en":""}',
  sort int not null default 0,
  published boolean not null default true,
  is_placeholder boolean not null default false
);

-- ───────────────────────── Leads ─────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null default 'info' check (type in ('info','price','visit','whatsapp_click')),
  status text not null default 'new' check (status in ('new','contacted','visit','negotiation','closed','lost')),
  name text,
  email text,
  phone text,
  project_id uuid references public.projects(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  interest text,
  budget text,
  message text,
  locale text not null default 'es',
  visit_date date,
  visit_time text,
  visit_mode text check (visit_mode in ('presencial','virtual')),
  source_url text,
  utm jsonb,
  ip_hash text
);
create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_ip_idx on public.leads (ip_hash, created_at desc);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author text,
  body text not null,
  created_at timestamptz not null default now()
);

-- ───────────────────────── RLS ─────────────────────────
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.projects enable row level security;
alter table public.villa_models enable row level security;
alter table public.units enable row level security;
alter table public.properties enable row level security;
alter table public.media enable row level security;
alter table public.posts enable row level security;
alter table public.faqs enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;

-- Public read
create policy "public read settings" on public.settings for select using (true);
create policy "public read projects" on public.projects for select using (published or public.is_staff());
create policy "public read models" on public.villa_models for select using (true);
create policy "public read units" on public.units for select using (true);
create policy "public read properties" on public.properties for select using (published or public.is_staff());
create policy "public read media" on public.media for select using (true);
create policy "public read posts" on public.posts for select using (published or public.is_staff());
create policy "public read faqs" on public.faqs for select using (published or public.is_staff());

-- Staff write
create policy "staff write projects" on public.projects for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write models" on public.villa_models for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write units" on public.units for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write properties" on public.properties for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write media" on public.media for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write posts" on public.posts for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write faqs" on public.faqs for all using (public.is_staff()) with check (public.is_staff());
create policy "admin write settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- Leads: inserted only by the server (service role). Staff can read/update.
create policy "staff read leads" on public.leads for select using (public.is_staff());
create policy "staff update leads" on public.leads for update using (public.is_staff()) with check (public.is_staff());
create policy "admin delete leads" on public.leads for delete using (public.is_admin());
create policy "staff notes" on public.lead_notes for all using (public.is_staff()) with check (public.is_staff());

-- Profiles
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admin manage profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- ───────────────────────── Storage ─────────────────────────
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

create policy "public read media bucket" on storage.objects for select using (bucket_id = 'media');
create policy "staff upload media" on storage.objects for insert with check (bucket_id = 'media' and public.is_staff());
create policy "staff update media" on storage.objects for update using (bucket_id = 'media' and public.is_staff());
create policy "staff delete media" on storage.objects for delete using (bucket_id = 'media' and public.is_staff());
