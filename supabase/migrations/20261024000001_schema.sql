-- GeekLoop schema (PRD §11). Money in integer cents. Enums are Postgres enums.

create extension if not exists pgcrypto;

create type public.user_role as enum ('partner', 'staff', 'volunteer');
create type public.partner_tier as enum ('community', 'impact', 'champion');
create type public.batch_status as enum ('submitted', 'approved', 'declined', 'scheduled', 'received', 'in_refurbishment', 'completed');
create type public.logistics_type as enum ('dropoff', 'pickup');
create type public.device_category as enum ('laptop', 'desktop', 'monitor', 'tablet', 'accessory', 'other');
create type public.device_condition as enum ('working', 'partially_working', 'not_working', 'unknown');
create type public.device_source as enum ('partner', 'household');
create type public.device_status as enum (
  'received', 'testing', 'wipe_pending_verification', 'wipe_verified', 'refurbishing', 'ready', 'listed', 'sold', 'recycled'
);
create type public.sale_channel as enum ('in_store', 'online', 'b2b');
create type public.recipient_category as enum (
  'student', 'newcomer', 'senior', 'low_income_household', 'nonprofit', 'small_business', 'general', 'undisclosed'
);
create type public.event_type as enum ('status_change', 'step_completed', 'assigned', 'note', 'sale', 'subsidy');
create type public.checklist_step as enum ('hardware_test', 'wipe_performed', 'wipe_verified', 'os_installed', 'final_qa');
create type public.fund_tx_type as enum ('contribution', 'subsidy', 'sponsorship');
create type public.payment_provider as enum ('stripe', 'mock', 'manual');
create type public.checker_outcome as enum ('accepted', 'recycling_only', 'not_accepted', 'partner_redirect');

-- ---------------------------------------------------------------- organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique,
  industry text,
  employee_range text,
  website text,
  logo_path text,
  contact_email text,
  contact_phone text,
  owner_id uuid,
  tier public.partner_tier not null default 'community',
  membership_started_at timestamptz,
  membership_expires_at timestamptz,
  wall_opt_in boolean not null default false,
  passport_attribution_opt_in boolean not null default false
);

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  role public.user_role not null default 'partner',
  full_name text,
  display_first_name text,
  organization_id uuid references public.organizations (id) on delete set null,
  public_handle text unique check (public_handle ~ '^[a-z0-9-]{3,32}$'),
  attribution_opt_in boolean not null default false,
  public_profile_opt_in boolean not null default false
);
create index profiles_org_idx on public.profiles (organization_id);
create index profiles_role_idx on public.profiles (role);

alter table public.organizations
  add constraint organizations_owner_fk foreign key (owner_id) references public.profiles (id) on delete set null;

-- Staff-created invitations (AUTH-04): signing up with an invited email gets that role.
create table public.account_invites (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique check (email = lower(email)),
  role public.user_role not null,
  full_name text,
  organization_id uuid references public.organizations (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  used_at timestamptz
);

-- ---------------------------------------------------------------- batches
create table public.donation_batches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  submitted_by uuid references public.profiles (id) on delete set null,
  status public.batch_status not null default 'submitted',
  logistics public.logistics_type not null default 'dropoff',
  preferred_week date not null check (extract(isodow from preferred_week) = 1),
  scheduled_week date check (scheduled_week is null or extract(isodow from scheduled_week) = 1),
  pickup_address text,
  notes text,
  decline_reason text,
  schedule_override_note text,
  value_score int not null default 0 check (value_score between 0 and 100),
  data_handling_ack boolean not null default false,
  received_at timestamptz,
  completed_at timestamptz,
  constraint batch_ack_required check (data_handling_ack),
  constraint batch_decline_reason check (status <> 'declined' or coalesce(trim(decline_reason), '') <> ''),
  constraint batch_pickup_address check (logistics <> 'pickup' or coalesce(trim(pickup_address), '') <> '')
);
create index batches_org_idx on public.donation_batches (organization_id);
create index batches_status_idx on public.donation_batches (status);
create index batches_week_idx on public.donation_batches (scheduled_week);

create table public.batch_line_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  batch_id uuid not null references public.donation_batches (id) on delete cascade,
  category public.device_category not null,
  make text not null check (char_length(make) between 1 and 60),
  model text not null check (char_length(model) between 1 and 80),
  approx_year int check (approx_year between 1990 and 2100),
  quantity int not null check (quantity > 0 and quantity <= 500),
  condition public.device_condition not null default 'unknown'
);
create index line_items_batch_idx on public.batch_line_items (batch_id);

-- ---------------------------------------------------------------- devices
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  passport_code text not null unique check (passport_code ~ '^FGT-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$'),
  batch_id uuid references public.donation_batches (id) on delete cascade,
  line_item_id uuid references public.batch_line_items (id) on delete set null,
  source public.device_source not null,
  category public.device_category not null,
  make text not null,
  model text not null,
  cpu text,
  ram_gb int check (ram_gb is null or ram_gb between 0 and 1024),
  storage_gb int check (storage_gb is null or storage_gb between 0 and 100000),
  serial_number text,
  approx_year int,
  status public.device_status not null default 'received',
  assigned_volunteer_id uuid references public.profiles (id) on delete set null,
  wipe_method text,
  wipe_report_ref text,
  wipe_performed_by uuid references public.profiles (id) on delete set null,
  wipe_performed_at timestamptz,
  wipe_verified_by uuid references public.profiles (id) on delete set null,
  wipe_verified_at timestamptz,
  os_installed text,
  is_open_source_os boolean,
  refurbished_by uuid references public.profiles (id) on delete set null,
  refurbished_at timestamptz,
  price_cents int check (price_cents is null or price_cents >= 0),
  sold_at timestamptz,
  sale_channel public.sale_channel,
  recipient_category public.recipient_category,
  pif_subsidy_cents int not null default 0 check (pif_subsidy_cents >= 0),
  recycled_reason text,
  weight_kg numeric(6, 2) check (weight_kg is null or weight_kg > 0),
  passport_views int not null default 0,
  constraint device_source_batch check ((source = 'partner') = (batch_id is not null)),
  constraint device_recycle_reason check (status <> 'recycled' or coalesce(trim(recycled_reason), '') <> '')
);
create index devices_status_idx on public.devices (status);
create index devices_batch_idx on public.devices (batch_id);
create index devices_volunteer_idx on public.devices (assigned_volunteer_id);
create index devices_line_item_idx on public.devices (line_item_id);

-- Append-only chain of custody (PRD §9.1). No update/delete policies exist.
create table public.device_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  device_id uuid not null references public.devices (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  event_type public.event_type not null,
  from_status public.device_status,
  to_status public.device_status,
  step public.checklist_step,
  note text,
  metadata jsonb not null default '{}'::jsonb
);
create index device_events_device_idx on public.device_events (device_id, created_at);
create index device_events_actor_idx on public.device_events (actor_id);

-- ---------------------------------------------------------------- certificates
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  certificate_number text not null unique check (certificate_number ~ '^GL-[0-9]{4}-[0-9]{4,}$'),
  batch_id uuid not null unique references public.donation_batches (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  issued_by uuid references public.profiles (id) on delete set null,
  issued_at timestamptz not null default now(),
  device_count int not null check (device_count > 0),
  pdf_path text
);
create index certificates_org_idx on public.certificates (organization_id);

-- ---------------------------------------------------------------- badges
create table public.badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null,
  criterion_type text not null check (criterion_type in ('final_qa', 'hardware_test', 'wipe_verified', 'open_source_install', 'manual')),
  threshold int not null default 0
);

create table public.volunteer_badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  volunteer_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  awarded_by uuid references public.profiles (id) on delete set null,
  unique (volunteer_id, badge_id)
);

-- ---------------------------------------------------------------- money (P1)
create table public.fund_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type public.fund_tx_type not null,
  amount_cents int not null check (amount_cents <> 0),
  organization_id uuid references public.organizations (id) on delete set null,
  device_id uuid references public.devices (id) on delete set null,
  provider public.payment_provider not null default 'manual',
  provider_ref text unique,
  note text,
  constraint fund_direction check ((type = 'subsidy') = (amount_cents < 0))
);
create index fund_org_idx on public.fund_transactions (organization_id);

create table public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tier public.partner_tier not null,
  amount_cents int not null check (amount_cents >= 0),
  provider public.payment_provider not null,
  provider_ref text unique,
  period_start date not null,
  period_end date not null
);

-- ---------------------------------------------------------------- settings
create table public.settings (
  id int primary key default 1 check (id = 1),
  created_at timestamptz not null default now(),
  weekly_capacity_devices int not null default 20 check (weekly_capacity_devices > 0),
  refurb_minutes_uniform int not null default 60 check (refurb_minutes_uniform > 0),
  refurb_minutes_mixed int not null default 120 check (refurb_minutes_mixed > 0),
  batch_score_weights jsonb not null default '{"uniformity":0.4,"youth":0.25,"volume":0.2,"laptopShare":0.15}'::jsonb,
  max_device_age_years int not null default 8 check (max_device_age_years > 0),
  price_breakdown jsonb not null default '[]'::jsonb,
  price_breakdown_confirmed boolean not null default false,
  accepted_items jsonb not null default '[]'::jsonb
);

create table public.impact_factors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category public.device_category not null unique,
  avg_weight_kg numeric(6, 2) not null check (avg_weight_kg >= 0),
  co2e_avoided_kg_per_reuse numeric(8, 2) not null check (co2e_avoided_kg_per_reuse >= 0),
  source_title text not null default 'TO VERIFY',
  source_url text,
  last_reviewed date
);

create table public.checker_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category public.device_category not null,
  outcome public.checker_outcome not null,
  is_business boolean not null default false
);
