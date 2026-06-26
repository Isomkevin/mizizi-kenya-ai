-- Mizizi Phase 0 schema
-- Multi-tenant foundation with RLS and JSON payload support.

create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id text primary key,
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  user_id uuid,
  full_name text not null,
  role text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cooperatives (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null,
  county text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.farmers (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text not null,
  profile jsonb not null,
  county text,
  risk text,
  decision_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, farmer_id)
);

create table if not exists public.applications (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text not null references public.farmers(id) on delete cascade,
  cooperative_id text references public.cooperatives(id) on delete set null,
  amount_kes numeric(14, 2) not null,
  crop_type text not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.loans (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text not null references public.farmers(id) on delete cascade,
  application_id text references public.applications(id) on delete set null,
  principal_kes numeric(14, 2) not null,
  term_months integer not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decisions (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text not null references public.farmers(id) on delete cascade,
  application_id text,
  status text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text references public.farmers(id) on delete set null,
  event_type text not null,
  actor text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text not null references public.farmers(id) on delete cascade,
  name text not null,
  doc_type text not null,
  verification_status text not null,
  source text,
  payload jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.communications (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  farmer_id text references public.farmers(id) on delete set null,
  channel text not null,
  message text not null,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.climate_observations (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  county text not null,
  lat double precision,
  lon double precision,
  rainfall_mm double precision not null,
  drought_probability double precision not null,
  source text not null default 'open-meteo',
  observed_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  snapshot_type text not null,
  snapshot_date date not null default current_date,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null references public.tenants(id) on delete cascade,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.graph_views (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  user_id text not null,
  name text not null,
  farmer_id text references public.farmers(id) on delete set null,
  filters jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_tenant on public.profiles(tenant_id);
create index if not exists idx_farmers_tenant on public.farmers(tenant_id);
create index if not exists idx_applications_tenant on public.applications(tenant_id);
create index if not exists idx_loans_tenant on public.loans(tenant_id);
create index if not exists idx_decisions_tenant on public.decisions(tenant_id);
create index if not exists idx_activity_events_tenant on public.activity_events(tenant_id);
create index if not exists idx_documents_tenant on public.documents(tenant_id);
create index if not exists idx_communications_tenant on public.communications(tenant_id);
create index if not exists idx_climate_observations_tenant on public.climate_observations(tenant_id);
create index if not exists idx_analytics_snapshots_tenant on public.analytics_snapshots(tenant_id);
create index if not exists idx_audit_log_tenant on public.audit_log(tenant_id);
create index if not exists idx_graph_views_tenant on public.graph_views(tenant_id);

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.cooperatives enable row level security;
alter table public.farmers enable row level security;
alter table public.applications enable row level security;
alter table public.loans enable row level security;
alter table public.decisions enable row level security;
alter table public.activity_events enable row level security;
alter table public.documents enable row level security;
alter table public.communications enable row level security;
alter table public.climate_observations enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.audit_log enable row level security;
alter table public.graph_views enable row level security;

drop policy if exists tenant_select_tenants on public.tenants;
create policy tenant_select_tenants on public.tenants
for select
using (id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_profiles on public.profiles;
create policy tenant_all_profiles on public.profiles
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_cooperatives on public.cooperatives;
create policy tenant_all_cooperatives on public.cooperatives
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_farmers on public.farmers;
create policy tenant_all_farmers on public.farmers
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_applications on public.applications;
create policy tenant_all_applications on public.applications
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_loans on public.loans;
create policy tenant_all_loans on public.loans
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_decisions on public.decisions;
create policy tenant_all_decisions on public.decisions
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_activity_events on public.activity_events;
create policy tenant_all_activity_events on public.activity_events
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_documents on public.documents;
create policy tenant_all_documents on public.documents
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_communications on public.communications;
create policy tenant_all_communications on public.communications
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_climate_observations on public.climate_observations;
create policy tenant_all_climate_observations on public.climate_observations
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_analytics_snapshots on public.analytics_snapshots;
create policy tenant_all_analytics_snapshots on public.analytics_snapshots
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_audit_log on public.audit_log;
create policy tenant_all_audit_log on public.audit_log
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));

drop policy if exists tenant_all_graph_views on public.graph_views;
create policy tenant_all_graph_views on public.graph_views
for all
using (tenant_id = current_setting('app.tenant_id', true))
with check (tenant_id = current_setting('app.tenant_id', true));
