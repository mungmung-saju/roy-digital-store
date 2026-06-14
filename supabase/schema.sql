-- ============================================================
-- Digital Product Store – Supabase/PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
-- orders table
-- ────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  product_name        text             not null,
  buyer_email         text             not null,
  payment_method      text             not null check (payment_method in ('paypal', 'usdt')),
  payment_status      text             not null default 'pending'
                        check (payment_status in ('pending', 'completed', 'failed')),
  -- Encrypted with AES-256-GCM server-side; never returned to the browser
  account_credentials text             not null,
  -- Raw payment provider identifiers for reconciliation
  provider_order_id   text,
  provider_payment_id text,
  amount_usd          numeric(10, 2),
  created_at          timestamptz      not null default now(),
  updated_at          timestamptz      not null default now()
);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- ────────────────────────────────────────────────────────────
-- products table
-- ────────────────────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text        not null,
  description text,
  price_usd   numeric(10, 2) not null,
  badge       text,
  credentials text,           -- encrypted account credentials pool (server-side only)
  stock       integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- Seed products
-- IDs match lib/products.js so static fallback and DB are in sync.
-- Adjust price_usd and stock to your actual inventory.
-- ────────────────────────────────────────────────────────────
insert into public.products (id, slug, name, description, price_usd, badge, stock) values

  -- Claude / Anthropic
  ('00000000-0000-0000-0000-000000000001', 'claude-pro',
   'Claude Pro',
   'Anthropic Claude Pro – 5x usage limit, 1 month access.',
   19.99, null, 50),

  ('00000000-0000-0000-0000-000000000010', 'claude-max-5x-12mo',
   'Claude Max 5x – 12 Months',
   'Claude Max with 5x usage limit – full year subscription.',
   179.99, 'Popular', 20),

  ('00000000-0000-0000-0000-000000000011', 'claude-max-20x-12mo',
   'Claude Max 20x – 12 Months',
   'Claude Max with 20x usage limit – full year, highest tier.',
   479.99, 'Premium', 10),

  -- Google Gemini
  ('00000000-0000-0000-0000-000000000002', 'gemini-advanced',
   'Gemini Advanced',
   'Google Gemini Advanced – 1 month access.',
   19.99, null, 40),

  ('00000000-0000-0000-0000-000000000006', 'gemini-pro-12mo',
   'Gemini Pro – 12 Months',
   'Google Gemini Pro – full year access at a great value.',
   149.99, 'Best Value', 25),

  ('00000000-0000-0000-0000-000000000007', 'gemini-ultra-12mo',
   'Gemini Ultra – 12 Months',
   'Google Gemini Ultra – full year, top-tier model access.',
   239.99, 'Premium', 15),

  -- YouTube
  ('00000000-0000-0000-0000-000000000003', 'youtube-premium',
   'YouTube Premium',
   'YouTube Premium – ad-free viewing, 1 month.',
   9.99, null, 80),

  ('00000000-0000-0000-0000-000000000008', 'youtube-premium-12mo',
   'YouTube Premium – 12 Months',
   'YouTube Premium – ad-free + downloads, full year.',
   79.99, 'Best Value', 50),

  -- CapCut
  ('00000000-0000-0000-0000-000000000004', 'capcut-pro',
   'CapCut Pro',
   'CapCut Pro – all premium editing features, 1 month.',
   12.99, null, 60),

  ('00000000-0000-0000-0000-000000000005', 'capcut-6mo-individual',
   'CapCut Individual Pro – 6 Months',
   'CapCut Individual Pro plan – 6 months full access.',
   29.99, 'Popular', 30),

  -- Canva
  ('00000000-0000-0000-0000-000000000009', 'canva-edu-pro-12mo',
   'Canva Edu Pro – 12 Months',
   'Canva Education Pro – all premium templates & features, full year.',
   119.99, 'New', 35)

on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  price_usd   = excluded.price_usd,
  badge       = excluded.badge;

-- ────────────────────────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────────────────────────
alter table public.orders   enable row level security;
alter table public.products enable row level security;

-- Public can read products
create policy "Products are publicly readable"
  on public.products for select
  using (true);

-- Only the service-role key (server) can read/write orders
create policy "Orders: service role only"
  on public.orders
  using (auth.role() = 'service_role');
