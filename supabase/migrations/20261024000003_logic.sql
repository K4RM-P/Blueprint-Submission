-- Business rules in the database (PRD §9) and public-safe RPCs (PRD §11).
-- auth.uid() is null for the service role (seed / payment webhook): those
-- callers bypass the actor checks below but never the data constraints.

-- ================================================================ helpers
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger devices_touch before update on public.devices
  for each row execute function public.touch_updated_at();

create or replace function public.slugify(p text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p, '')), '[^a-z0-9]+', '-', 'g'))
$$;

-- ================================================================ new users (AUTH-03, AUTH-04)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  inv public.account_invites;
  v_role public.user_role := 'partner';
  v_org uuid;
  v_name text := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  v_org_name text := nullif(trim(new.raw_user_meta_data->>'organization_name'), '');
  v_slug text;
begin
  select * into inv from public.account_invites where email = lower(new.email) and used_at is null;
  if found then
    v_role := inv.role;
    v_org := inv.organization_id;
    v_name := coalesce(v_name, inv.full_name);
    update public.account_invites set used_at = now() where id = inv.id;
  end if;

  insert into public.profiles (id, role, full_name, display_first_name, organization_id)
  values (new.id, v_role, v_name, split_part(coalesce(v_name, ''), ' ', 1), v_org);

  -- Self-serve partner sign-up creates the organization and makes the user its owner.
  if v_role = 'partner' and v_org is null and v_org_name is not null then
    v_slug := public.slugify(v_org_name);
    if v_slug = '' then v_slug := 'partner'; end if;
    if exists (select 1 from public.organizations where slug = v_slug) then
      v_slug := v_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
    end if;
    insert into public.organizations (name, slug, owner_id, contact_email)
    values (v_org_name, v_slug, new.id, lower(new.email))
    returning id into v_org;
    update public.profiles set organization_id = v_org where id = new.id;
  end if;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================================ column guards
create or replace function public.guard_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    if new.role is distinct from old.role or new.organization_id is distinct from old.organization_id then
      raise exception 'Only staff can change roles or organizations' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile();

create or replace function public.guard_organization()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_staff() then
    if new.tier is distinct from old.tier
      or new.membership_started_at is distinct from old.membership_started_at
      or new.membership_expires_at is distinct from old.membership_expires_at
      or new.owner_id is distinct from old.owner_id
      or new.slug is distinct from old.slug then
      raise exception 'Membership details can only be changed through checkout or by staff' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
create trigger organizations_guard before update on public.organizations
  for each row execute function public.guard_organization();

-- ================================================================ batch status machine (PRD §9.2)
create or replace function public.batch_transition_ok(p_from public.batch_status, p_to public.batch_status)
returns boolean language sql immutable as $$
  select (p_from, p_to) in (
    ('submitted', 'approved'), ('submitted', 'declined'),
    ('approved', 'scheduled'), ('scheduled', 'received'),
    ('received', 'in_refurbishment'), ('received', 'completed'),
    ('in_refurbishment', 'completed')
  )
$$;

create or replace function public.guard_batch()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and auth.uid() is not null then
    -- System updates (batch following its devices) run with geekloop.system = on.
    if not public.is_staff() and coalesce(current_setting('geekloop.system', true), '') <> 'on' then
      if new.status is distinct from old.status
        or new.scheduled_week is distinct from old.scheduled_week
        or new.decline_reason is distinct from old.decline_reason
        or new.received_at is distinct from old.received_at
        or new.completed_at is distinct from old.completed_at
        or new.organization_id is distinct from old.organization_id then
        raise exception 'Only staff can change a batch''s status or schedule' using errcode = '42501';
      end if;
    end if;
    if new.status is distinct from old.status and not public.batch_transition_ok(old.status, new.status) then
      raise exception 'A batch can''t go from % to %', old.status, new.status using errcode = '23514';
    end if;
  end if;
  if new.status = 'received' and new.received_at is null then new.received_at := now(); end if;
  if new.status = 'completed' and new.completed_at is null then new.completed_at := now(); end if;
  if new.status = 'scheduled' and new.scheduled_week is null then new.scheduled_week := new.preferred_week; end if;
  return new;
end $$;
create trigger batches_guard before insert or update on public.donation_batches
  for each row execute function public.guard_batch();

-- Completed automatically when every device is sold/listed/ready/recycled AND a certificate exists.
create or replace function public.maybe_complete_batch(p_batch uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  b public.donation_batches;
begin
  select * into b from public.donation_batches where id = p_batch for update;
  if not found or b.status not in ('received', 'in_refurbishment') then return; end if;
  if not exists (select 1 from public.certificates where batch_id = p_batch) then return; end if;
  perform set_config('geekloop.system', 'on', true);
  if not exists (select 1 from public.devices where batch_id = p_batch) then return; end if;
  if exists (select 1 from public.devices where batch_id = p_batch and status not in ('sold', 'listed', 'ready', 'recycled')) then return; end if;
  update public.donation_batches set status = 'completed', completed_at = now() where id = p_batch;
end $$;
revoke execute on function public.maybe_complete_batch(uuid) from public, anon, authenticated;

-- ================================================================ device status machine (PRD §9.1)
create or replace function public.device_transition_ok(p_from public.device_status, p_to public.device_status)
returns boolean language sql immutable as $$
  select (p_from, p_to) in (
    ('received', 'testing'), ('testing', 'wipe_pending_verification'),
    ('wipe_pending_verification', 'wipe_verified'), ('wipe_verified', 'refurbishing'),
    ('refurbishing', 'ready'), ('ready', 'listed'), ('listed', 'sold')
  ) or (p_to = 'recycled' and p_from not in ('sold', 'recycled'))
$$;

create or replace function public.guard_device()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role := public.auth_role();
begin
  if auth.uid() is null then
    return new; -- service role (seed): data constraints still apply
  end if;

  if tg_op = 'INSERT' then
    if v_role <> 'staff' then raise exception 'Only staff can add devices' using errcode = '42501'; end if;
    if new.status <> 'received' then raise exception 'New devices start as received' using errcode = '23514'; end if;
    return new;
  end if;

  -- Private verification fields: staff only.
  if v_role <> 'staff' and (new.wipe_verified_at is distinct from old.wipe_verified_at or new.wipe_verified_by is distinct from old.wipe_verified_by) then
    raise exception 'Only staff can verify a data wipe' using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    if not public.device_transition_ok(old.status, new.status) then
      raise exception 'A device can''t go from % to %', old.status, new.status using errcode = '23514';
    end if;
    if new.status = 'wipe_verified' then
      if v_role <> 'staff' then
        raise exception 'Only staff can verify a data wipe' using errcode = '42501';
      end if;
      new.wipe_verified_by := coalesce(new.wipe_verified_by, auth.uid());
      new.wipe_verified_at := coalesce(new.wipe_verified_at, now());
    end if;
    if new.status in ('ready', 'listed', 'sold') and new.wipe_verified_at is null then
      raise exception 'The data wipe must be verified before a device is %', new.status using errcode = '23514';
    end if;
    if v_role = 'volunteer' and new.status in ('listed', 'sold', 'recycled') then
      raise exception 'Only staff can list, sell or recycle devices' using errcode = '42501';
    end if;
    if new.status = 'sold' and new.sold_at is null then new.sold_at := now(); end if;
  end if;
  return new;
end $$;
create trigger devices_guard before insert or update on public.devices
  for each row execute function public.guard_device();

-- Every transition / assignment writes an append-only event (chain of custody).
create or replace function public.log_device_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return null; end if;
  if tg_op = 'INSERT' then
    insert into public.device_events (device_id, actor_id, event_type, to_status, note)
    values (new.id, auth.uid(), 'status_change', new.status, case when new.source = 'household' then 'Household intake' else 'Received from partner batch' end);
    return null;
  end if;
  if new.status is distinct from old.status then
    insert into public.device_events (device_id, actor_id, event_type, from_status, to_status, note)
    values (new.id, auth.uid(), 'status_change', old.status, new.status, case when new.status = 'recycled' then new.recycled_reason end);
  end if;
  if new.assigned_volunteer_id is distinct from old.assigned_volunteer_id then
    insert into public.device_events (device_id, actor_id, event_type, note, metadata)
    values (new.id, auth.uid(), 'assigned', case when new.assigned_volunteer_id is null then 'Unassigned' else 'Assigned to a volunteer' end,
            jsonb_build_object('volunteer_id', new.assigned_volunteer_id));
  end if;
  return null;
end $$;
create trigger devices_log after insert or update on public.devices
  for each row execute function public.log_device_change();

-- Batch follows its devices: received → in_refurbishment → (maybe) completed.
create or replace function public.sync_batch_from_device()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.batch_id is null or new.status is not distinct from old.status then return null; end if;
  perform set_config('geekloop.system', 'on', true);
  update public.donation_batches set status = 'in_refurbishment'
    where id = new.batch_id and status = 'received' and new.status <> 'received';
  perform public.maybe_complete_batch(new.batch_id);
  return null;
end $$;
create trigger devices_sync_batch after update on public.devices
  for each row execute function public.sync_batch_from_device();

-- device_events is append-only for everyone. Deletes are only possible as the
-- service role (demo reset cascades); updates are never possible.
create or replace function public.guard_device_events()
returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    raise exception 'device_events is append-only' using errcode = '42501';
  end if;
  if current_user not in ('postgres', 'service_role', 'supabase_admin') then
    raise exception 'device_events is append-only' using errcode = '42501';
  end if;
  return old;
end $$;
create trigger device_events_append_only before update or delete on public.device_events
  for each row execute function public.guard_device_events();

-- ================================================================ certificates (OPS-08)
create or replace function public.guard_certificate()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_total int;
  v_bad int;
begin
  select count(*), count(*) filter (where status not in ('wipe_verified', 'refurbishing', 'ready', 'listed', 'sold', 'recycled'))
    into v_total, v_bad from public.devices where batch_id = new.batch_id;
  if v_total = 0 then raise exception 'This batch has no devices yet' using errcode = '23514'; end if;
  if v_bad > 0 then raise exception '% device(s) still need a verified wipe or recycling', v_bad using errcode = '23514'; end if;
  new.device_count := v_total;
  select organization_id into new.organization_id from public.donation_batches where id = new.batch_id;
  return new;
end $$;
create trigger certificates_guard before insert on public.certificates
  for each row execute function public.guard_certificate();

create or replace function public.after_certificate()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.maybe_complete_batch(new.batch_id);
  return null;
end $$;
create trigger certificates_after after insert on public.certificates
  for each row execute function public.after_certificate();

-- ================================================================ fund can't go negative (PIF-03)
create or replace function public.guard_fund()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_balance bigint;
begin
  perform pg_advisory_xact_lock(hashtext('fund_transactions'));
  select coalesce(sum(amount_cents), 0) into v_balance from public.fund_transactions;
  if v_balance + new.amount_cents < 0 then
    raise exception 'The Pay-It-Forward fund can''t go negative' using errcode = '23514';
  end if;
  return new;
end $$;
create trigger fund_guard before insert on public.fund_transactions
  for each row execute function public.guard_fund();

-- ================================================================ volunteer bench RPCs (VW-01..VW-03)
create or replace function public.bench_queue(p_limit int default 10)
returns table (id uuid, passport_code text, category public.device_category, make text, model text, approx_year int, value_score int, source public.device_source, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select d.id, d.passport_code, d.category, d.make, d.model, d.approx_year, coalesce(b.value_score, 0), d.source, d.created_at
  from public.devices d left join public.donation_batches b on b.id = d.batch_id
  where public.auth_role() in ('volunteer', 'staff') and d.status = 'received' and d.assigned_volunteer_id is null
  order by coalesce(b.value_score, 0) desc, d.created_at asc
  limit least(greatest(p_limit, 1), 50)
$$;

-- Atomic claim: SKIP LOCKED means two volunteers never get the same device.
create or replace function public.claim_next_device()
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  if public.auth_role() <> 'volunteer' then raise exception 'Only volunteers can claim devices' using errcode = '42501'; end if;
  select d.id into v_id
  from public.devices d left join public.donation_batches b on b.id = d.batch_id
  where d.status = 'received' and d.assigned_volunteer_id is null
  order by coalesce(b.value_score, 0) desc, d.created_at asc
  limit 1
  for update of d skip locked;
  if v_id is null then return null; end if;
  update public.devices set assigned_volunteer_id = auth.uid() where id = v_id;
  return v_id;
end $$;

create or replace function public.complete_step(
  p_device uuid,
  p_step public.checklist_step,
  p_report_ref text default null,
  p_wipe_method text default null,
  p_os text default null,
  p_open_source boolean default true,
  p_note text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  d public.devices;
  v_uid uuid := auth.uid();
begin
  if public.auth_role() <> 'volunteer' then raise exception 'Only volunteers use the bench checklist' using errcode = '42501'; end if;
  select * into d from public.devices where id = p_device for update;
  if not found or d.assigned_volunteer_id is distinct from v_uid then
    raise exception 'This device isn''t on your bench' using errcode = '42501';
  end if;
  if exists (select 1 from public.device_events where device_id = p_device and event_type = 'step_completed' and step = p_step) then
    raise exception 'That step is already done' using errcode = '23505';
  end if;

  if p_step = 'hardware_test' then
    if d.status not in ('received', 'testing') then raise exception 'Hardware test happens before the data wipe' using errcode = '23514'; end if;
    if d.status = 'received' then update public.devices set status = 'testing' where id = p_device; end if;

  elsif p_step = 'wipe_performed' then
    if d.status <> 'testing' then raise exception 'Finish the hardware test first' using errcode = '23514'; end if;
    if coalesce(trim(p_report_ref), '') = '' then raise exception 'Enter the sanitization report ID' using errcode = '23514'; end if;
    update public.devices set
      wipe_report_ref = left(trim(p_report_ref), 120),
      wipe_method = coalesce(nullif(trim(p_wipe_method), ''), 'NIST 800-88 Purge (software overwrite)'),
      wipe_performed_by = v_uid,
      wipe_performed_at = now(),
      status = 'wipe_pending_verification'
    where id = p_device;

  elsif p_step = 'os_installed' then
    if d.status not in ('wipe_pending_verification', 'wipe_verified', 'refurbishing') then
      raise exception 'Install the OS after the data wipe' using errcode = '23514';
    end if;
    if coalesce(trim(p_os), '') = '' then raise exception 'Enter the operating system installed' using errcode = '23514'; end if;
    update public.devices set os_installed = left(trim(p_os), 80), is_open_source_os = coalesce(p_open_source, false),
      status = case when d.status = 'wipe_verified' then 'refurbishing'::public.device_status else d.status end
    where id = p_device;

  elsif p_step = 'final_qa' then
    if d.os_installed is null then raise exception 'Install the OS before final QA' using errcode = '23514'; end if;
    if d.status not in ('wipe_pending_verification', 'refurbishing') then raise exception 'This device isn''t ready for final QA' using errcode = '23514'; end if;
    update public.devices set refurbished_by = v_uid, refurbished_at = now(),
      status = case when d.status = 'refurbishing' then 'ready'::public.device_status else d.status end
    where id = p_device;

  else
    raise exception 'Volunteers can''t record that step' using errcode = '42501';
  end if;

  insert into public.device_events (device_id, actor_id, event_type, step, note, metadata)
  values (p_device, v_uid, 'step_completed', p_step, nullif(trim(coalesce(p_note, '')), ''),
    case
      when p_step = 'wipe_performed' then jsonb_build_object('report_recorded', true)
      when p_step = 'os_installed' then jsonb_build_object('os', trim(p_os), 'is_open_source', coalesce(p_open_source, false))
      else '{}'::jsonb
    end);

  select * into d from public.devices where id = p_device;
  return jsonb_build_object('status', d.status);
end $$;

create or replace function public.my_volunteer_stats()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when auth.uid() is null then null else public.volunteer_stats(auth.uid()) end
$$;

-- ================================================================ partner-safe device view (PRD §12)
create or replace function public.partner_devices(p_batch uuid default null)
returns table (
  id uuid, passport_code text, batch_id uuid, line_item_id uuid, category public.device_category, make text, model text,
  serial_number text, approx_year int, status public.device_status, recipient_category public.recipient_category,
  created_at timestamptz, wipe_verified_at timestamptz, wipe_method text, refurbished_at timestamptz, sold_at timestamptz,
  weight_kg numeric, line_quantity int, received_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select d.id, d.passport_code, d.batch_id, d.line_item_id, d.category, d.make, d.model,
    d.serial_number, d.approx_year, d.status,
    case when d.status = 'sold' then d.recipient_category end,
    d.created_at, d.wipe_verified_at, d.wipe_method, d.refurbished_at, d.sold_at,
    d.weight_kg, li.quantity, b.received_at
  from public.devices d
  join public.donation_batches b on b.id = d.batch_id
  left join public.batch_line_items li on li.id = d.line_item_id
  where b.organization_id = public.auth_org_id()
    and (p_batch is null or d.batch_id = p_batch)
  order by d.created_at, d.passport_code
$$;

-- Devices booked per week across ALL partners (counts only, no partner data) for the capacity calendar.
create or replace function public.week_loads(p_from date, p_to date)
returns table (week date, devices bigint)
language sql stable security definer set search_path = public as $$
  select coalesce(b.scheduled_week, b.preferred_week) as week, coalesce(sum(li.quantity), 0)
  from public.donation_batches b join public.batch_line_items li on li.batch_id = b.id
  where auth.uid() is not null
    and b.status in ('approved', 'scheduled')
    and coalesce(b.scheduled_week, b.preferred_week) between p_from and p_to
  group by 1
$$;

-- ================================================================ public RPCs (anon-safe)
create or replace function public.get_passport(p_code text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  d public.devices;
  b public.donation_batches;
  o public.organizations;
  v_volunteer text;
  v_ready timestamptz;
  v_listed timestamptz;
  v_qty int;
  f public.impact_factors;
  s public.settings;
begin
  select * into d from public.devices where passport_code = upper(trim(p_code));
  if not found then return null; end if;
  update public.devices set passport_views = passport_views + 1 where id = d.id;

  if d.batch_id is not null then
    select * into b from public.donation_batches where id = d.batch_id;
    select * into o from public.organizations where id = b.organization_id;
    select quantity into v_qty from public.batch_line_items where id = d.line_item_id;
  end if;
  select coalesce(nullif(p.display_first_name, ''), split_part(p.full_name, ' ', 1)) into v_volunteer
    from public.profiles p where p.id = d.refurbished_by and p.attribution_opt_in;
  select min(created_at) into v_ready from public.device_events where device_id = d.id and to_status = 'ready';
  select * into f from public.impact_factors where category = d.category;
  select * into s from public.settings where id = 1;

  return jsonb_build_object(
    'code', d.passport_code,
    'category', d.category, 'make', d.make, 'model', d.model, 'cpu', d.cpu,
    'ram_gb', d.ram_gb, 'storage_gb', d.storage_gb, 'approx_year', d.approx_year,
    'status', d.status,
    'os_installed', d.os_installed, 'is_open_source_os', d.is_open_source_os,
    'weight_kg', d.weight_kg,
    'uniform', coalesce(v_qty, 0) >= 5,
    'pif_subsidized', d.pif_subsidy_cents > 0,
    'donor', jsonb_build_object(
      'type', d.source,
      'name', case when o.passport_attribution_opt_in then o.name end,
      'logo_path', case when o.passport_attribution_opt_in then o.logo_path end
    ),
    'volunteer_first_name', v_volunteer,
    'timeline', jsonb_build_object(
      'donated_at', coalesce(b.received_at, d.created_at),
      'wipe_verified_at', d.wipe_verified_at,
      'refurbished_at', d.refurbished_at,
      'ready_at', v_ready,
      'in_new_home', d.status = 'sold'
    ),
    'factor', case when f.id is null then null else jsonb_build_object(
      'category', f.category, 'avg_weight_kg', f.avg_weight_kg, 'co2e_avoided_kg_per_reuse', f.co2e_avoided_kg_per_reuse,
      'source_title', f.source_title, 'source_url', f.source_url) end,
    'price_breakdown', s.price_breakdown,
    'price_breakdown_confirmed', s.price_breakdown_confirmed
  );
end $$;

-- Grouped, anonymous rows for lib/impact.ts (the formula lives once, in TypeScript).
create or replace function public.public_impact_totals()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'rows', coalesce((
      select jsonb_agg(r) from (
        select d.category, d.status, d.weight_kg, coalesce(li.quantity, 0) >= 5 as uniform,
          d.refurbished_at is not null as refurbished,
          case when d.status = 'sold' then d.recipient_category end as recipient,
          count(*) as count
        from public.devices d left join public.batch_line_items li on li.id = d.line_item_id
        group by 1, 2, 3, 4, 5, 6
      ) r), '[]'::jsonb),
    'active_partners', (select count(*) from public.organizations o where exists (select 1 from public.donation_batches b where b.organization_id = o.id and b.status <> 'declined')),
    'active_volunteers', (select count(*) from public.profiles where role = 'volunteer'),
    'passport_views', (select coalesce(sum(passport_views), 0) from public.devices)
  )
$$;

create or replace function public.verify_certificate(p_number text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('certificate_number', c.certificate_number, 'partner_name', o.name, 'device_count', c.device_count, 'issued_at', c.issued_at)
  from public.certificates c join public.organizations o on o.id = c.organization_id
  where c.certificate_number = upper(trim(p_number))
$$;

create or replace function public.partner_wall()
returns table (name text, slug text, tier public.partner_tier, logo_path text, devices_reused bigint, devices_received bigint, partner_since timestamptz)
language sql stable security definer set search_path = public as $$
  select o.name, o.slug, o.tier, o.logo_path,
    count(d.id) filter (where d.status = 'sold'),
    count(d.id),
    o.created_at
  from public.organizations o
  left join public.donation_batches b on b.organization_id = o.id
  left join public.devices d on d.batch_id = b.id
  where o.wall_opt_in
  group by o.id
  order by case o.tier when 'champion' then 0 when 'impact' then 1 else 2 end, count(d.id) filter (where d.status = 'sold') desc, o.name
$$;

create or replace function public.public_settings()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('price_breakdown', price_breakdown, 'price_breakdown_confirmed', price_breakdown_confirmed,
    'accepted_items', accepted_items, 'refurb_minutes_uniform', refurb_minutes_uniform, 'refurb_minutes_mixed', refurb_minutes_mixed)
  from public.settings where id = 1
$$;

create or replace function public.public_volunteer_profile(p_handle text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'first_name', coalesce(nullif(p.display_first_name, ''), split_part(p.full_name, ' ', 1)),
    'member_since', p.created_at,
    'devices_refurbished', (select count(*) from public.device_events e where e.actor_id = p.id and e.event_type = 'step_completed' and e.step = 'final_qa'),
    'badges', coalesce((
      select jsonb_agg(jsonb_build_object('slug', bd.slug, 'name', bd.name, 'description', bd.description, 'awarded_at', vb.awarded_at) order by vb.awarded_at)
      from public.volunteer_badges vb join public.badges bd on bd.id = vb.badge_id where vb.volunteer_id = p.id), '[]'::jsonb)
  )
  from public.profiles p
  where p.public_handle = lower(trim(p_handle)) and p.public_profile_opt_in and p.role = 'volunteer'
$$;

create or replace function public.public_fund_summary()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'raised_cents', coalesce(sum(amount_cents) filter (where amount_cents > 0), 0),
    'balance_cents', coalesce(sum(amount_cents), 0),
    'devices_subsidized', (select count(*) from public.devices where pif_subsidy_cents > 0),
    'contributions', count(*) filter (where type = 'contribution')
  ) from public.fund_transactions
$$;

create or replace function public.log_checker(p_category public.device_category, p_outcome public.checker_outcome, p_is_business boolean)
returns void language sql volatile security definer set search_path = public as $$
  insert into public.checker_logs (category, outcome, is_business) values (p_category, p_outcome, coalesce(p_is_business, false))
$$;

-- ================================================================ grants
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.claim_next_device() from anon;
revoke execute on function public.complete_step(uuid, public.checklist_step, text, text, text, boolean, text) from anon;
revoke execute on function public.bench_queue(int) from anon;
revoke execute on function public.my_volunteer_stats() from anon;
revoke execute on function public.partner_devices(uuid) from anon;
revoke execute on function public.week_loads(date, date) from anon;
grant execute on function public.get_passport(text), public.public_impact_totals(), public.verify_certificate(text),
  public.partner_wall(), public.public_settings(), public.public_volunteer_profile(text), public.public_fund_summary(),
  public.log_checker(public.device_category, public.checker_outcome, boolean)
  to anon, authenticated;
