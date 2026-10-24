-- Row Level Security (PRD §12). Every table has RLS on. Anonymous visitors read
-- nothing from base tables except badges and impact_factors; everything else
-- public goes through security-definer RPCs in 0003_logic.sql.
--
-- Helper names: `current_role` is a reserved SQL keyword, so the helpers are
-- auth_role() and auth_org_id().

create or replace function public.auth_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.auth_org_id()
returns uuid
language sql stable security definer set search_path = public
as $$ select organization_id from public.profiles where id = auth.uid() $$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce((select role = 'staff' from public.profiles where id = auth.uid()), false) $$;

revoke execute on function public.auth_role(), public.auth_org_id(), public.is_staff() from anon;

-- Badge criteria counts for a volunteer (PRD §9.5). The pure evaluator lives in
-- lib/badges.ts; this lets RLS confirm a self-awarded badge is genuinely earned.
create or replace function public.volunteer_stats(p_volunteer uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'finalQa', (select count(*) from public.device_events e where e.actor_id = p_volunteer and e.event_type = 'step_completed' and e.step = 'final_qa'),
    'hardwareTests', (select count(*) from public.device_events e where e.actor_id = p_volunteer and e.event_type = 'step_completed' and e.step = 'hardware_test'),
    'verifiedWipes', (select count(*) from public.devices d where d.wipe_performed_by = p_volunteer and d.wipe_verified_at is not null),
    'openSourceInstalls', (select count(*) from public.device_events e where e.actor_id = p_volunteer and e.event_type = 'step_completed' and e.step = 'os_installed' and coalesce((e.metadata->>'is_open_source')::boolean, false))
  )
$$;
revoke execute on function public.volunteer_stats(uuid) from public, anon;

create or replace function public.volunteer_qualifies(p_badge uuid)
returns boolean
language plpgsql stable security definer set search_path = public
as $$
declare
  b public.badges;
  s jsonb;
  v int;
begin
  select * into b from public.badges where id = p_badge;
  if not found or b.criterion_type = 'manual' or public.auth_role() <> 'volunteer' then
    return false;
  end if;
  s := public.volunteer_stats(auth.uid());
  v := case b.criterion_type
    when 'final_qa' then (s->>'finalQa')::int
    when 'hardware_test' then (s->>'hardwareTests')::int
    when 'wipe_verified' then (s->>'verifiedWipes')::int
    when 'open_source_install' then (s->>'openSourceInstalls')::int
    else 0 end;
  return v >= b.threshold;
end $$;
revoke execute on function public.volunteer_qualifies(uuid) from public, anon;
grant execute on function public.volunteer_qualifies(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.account_invites enable row level security;
alter table public.donation_batches enable row level security;
alter table public.batch_line_items enable row level security;
alter table public.devices enable row level security;
alter table public.device_events enable row level security;
alter table public.certificates enable row level security;
alter table public.badges enable row level security;
alter table public.volunteer_badges enable row level security;
alter table public.fund_transactions enable row level security;
alter table public.membership_payments enable row level security;
alter table public.settings enable row level security;
alter table public.impact_factors enable row level security;
alter table public.checker_logs enable row level security;

-- ---------------------------------------------------------------- organizations
create policy org_select on public.organizations for select to authenticated
  using (public.is_staff() or id = public.auth_org_id());
create policy org_update on public.organizations for update to authenticated
  using (public.is_staff() or id = public.auth_org_id())
  with check (public.is_staff() or id = public.auth_org_id());
create policy org_staff_insert on public.organizations for insert to authenticated
  with check (public.is_staff());

-- ---------------------------------------------------------------- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or public.is_staff()
    or (organization_id is not null and organization_id = public.auth_org_id())
  );
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_staff())
  with check (id = auth.uid() or public.is_staff());

-- ---------------------------------------------------------------- invites
create policy invites_staff on public.account_invites for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
-- Partners may invite colleagues into their own organization (PP-13).
create policy invites_partner_select on public.account_invites for select to authenticated
  using (organization_id = public.auth_org_id());
create policy invites_partner_insert on public.account_invites for insert to authenticated
  with check (public.auth_role() = 'partner' and role = 'partner' and organization_id = public.auth_org_id());

-- ---------------------------------------------------------------- batches
create policy batches_select on public.donation_batches for select to authenticated
  using (public.is_staff() or organization_id = public.auth_org_id());
create policy batches_insert on public.donation_batches for insert to authenticated
  with check (
    public.is_staff()
    or (public.auth_role() = 'partner' and organization_id = public.auth_org_id() and status = 'submitted' and submitted_by = auth.uid())
  );
create policy batches_update on public.donation_batches for update to authenticated
  using (public.is_staff() or (organization_id = public.auth_org_id() and status = 'submitted'))
  with check (public.is_staff() or (organization_id = public.auth_org_id() and status = 'submitted'));
create policy batches_delete on public.donation_batches for delete to authenticated
  using (public.is_staff() or (organization_id = public.auth_org_id() and status = 'submitted'));

-- ---------------------------------------------------------------- line items
create policy line_items_select on public.batch_line_items for select to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.donation_batches b where b.id = batch_id and b.organization_id = public.auth_org_id())
  );
create policy line_items_write on public.batch_line_items for all to authenticated
  using (
    public.is_staff()
    or exists (select 1 from public.donation_batches b where b.id = batch_id and b.organization_id = public.auth_org_id() and b.status = 'submitted')
  )
  with check (
    public.is_staff()
    or exists (select 1 from public.donation_batches b where b.id = batch_id and b.organization_id = public.auth_org_id() and b.status = 'submitted')
  );

-- ---------------------------------------------------------------- devices
-- Staff: everything. Volunteers: devices assigned to them (writes only via RPCs).
-- Partners: no direct access — they read through partner_devices(), which omits
-- wipe_report_ref (PRD §12).
create policy devices_staff on public.devices for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy devices_volunteer_select on public.devices for select to authenticated
  using (assigned_volunteer_id = auth.uid());

-- ---------------------------------------------------------------- device events (append-only)
create policy events_select on public.device_events for select to authenticated
  using (
    public.is_staff()
    or actor_id = auth.uid()
    or exists (select 1 from public.devices d where d.id = device_id and d.assigned_volunteer_id = auth.uid())
    or exists (
      select 1 from public.devices d join public.donation_batches b on b.id = d.batch_id
      where d.id = device_id and b.organization_id = public.auth_org_id()
    )
  );
create policy events_insert on public.device_events for insert to authenticated
  with check (
    actor_id = auth.uid()
    and (
      public.is_staff()
      or exists (select 1 from public.devices d where d.id = device_id and d.assigned_volunteer_id = auth.uid())
    )
  );
-- Intentionally NO update or delete policy on device_events.

-- ---------------------------------------------------------------- certificates
create policy certificates_select on public.certificates for select to authenticated
  using (public.is_staff() or organization_id = public.auth_org_id());
create policy certificates_staff_insert on public.certificates for insert to authenticated
  with check (public.is_staff() and issued_by = auth.uid());
create policy certificates_staff_update on public.certificates for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------- badges
create policy badges_read on public.badges for select to anon, authenticated using (true);
create policy badges_staff on public.badges for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy volunteer_badges_select on public.volunteer_badges for select to authenticated
  using (volunteer_id = auth.uid() or public.is_staff());
create policy volunteer_badges_staff on public.volunteer_badges for insert to authenticated
  with check (public.is_staff() and awarded_by = auth.uid());
-- Volunteers self-award automatic badges only when the database agrees they qualify.
create policy volunteer_badges_self on public.volunteer_badges for insert to authenticated
  with check (
    volunteer_id = auth.uid()
    and awarded_by is null
    and public.volunteer_qualifies(badge_id)
  );

-- ---------------------------------------------------------------- money
create policy fund_select on public.fund_transactions for select to authenticated
  using (public.is_staff() or (type = 'sponsorship' and organization_id = public.auth_org_id()));
create policy fund_staff_insert on public.fund_transactions for insert to authenticated
  with check (public.is_staff() and provider = 'manual');

create policy membership_select on public.membership_payments for select to authenticated
  using (public.is_staff() or organization_id = public.auth_org_id());

-- ---------------------------------------------------------------- settings & factors
create policy settings_read on public.settings for select to authenticated using (true);
create policy settings_staff on public.settings for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

create policy factors_read on public.impact_factors for select to anon, authenticated using (true);
create policy factors_staff on public.impact_factors for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------- checker logs
create policy checker_staff_read on public.checker_logs for select to authenticated using (public.is_staff());
