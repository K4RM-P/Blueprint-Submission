-- Alignment pass: certificates document FGT's process (no unconfirmed standard), the
-- store link, partner passport views and the certificate device table.
-- Every new column is optional, so the app keeps working before this migration runs
-- (code falls back to the defaults in lib/certificate-wording.ts).

-- ---------------------------------------------------------------- settings (staff-editable)
alter table public.settings
  add column if not exists sanitization_standard text check (sanitization_standard is null or char_length(sanitization_standard) <= 120),
  add column if not exists sanitization_process text check (sanitization_process is null or char_length(sanitization_process) <= 800),
  add column if not exists certificate_disclaimer text check (certificate_disclaimer is null or char_length(certificate_disclaimer) <= 400),
  add column if not exists store_url text check (store_url is null or store_url ~ '^https?://[^\s]+$');

-- public_settings(): add the store link and the public certificate wording. Nothing private.
create or replace function public.public_settings()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('price_breakdown', price_breakdown, 'price_breakdown_confirmed', price_breakdown_confirmed,
    'accepted_items', accepted_items, 'refurb_minutes_uniform', refurb_minutes_uniform, 'refurb_minutes_mixed', refurb_minutes_mixed,
    'store_url', store_url, 'sanitization_standard', sanitization_standard,
    'sanitization_process', sanitization_process, 'certificate_disclaimer', certificate_disclaimer)
  from public.settings where id = 1
$$;

-- verify_certificate(): also confirm how many devices were wiped vs recycled and the last
-- verification date. Still no serials, report IDs or people.
create or replace function public.verify_certificate(p_number text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'certificate_number', c.certificate_number, 'partner_name', o.name, 'device_count', c.device_count, 'issued_at', c.issued_at,
    'wiped_count', (select count(*) from public.devices d where d.batch_id = c.batch_id and d.wipe_verified_at is not null),
    'recycled_count', (select count(*) from public.devices d where d.batch_id = c.batch_id and d.status = 'recycled' and d.wipe_verified_at is null),
    'last_verified_at', (select max(d.wipe_verified_at) from public.devices d where d.batch_id = c.batch_id))
  from public.certificates c join public.organizations o on o.id = c.organization_id
  where c.certificate_number = upper(trim(p_number))
$$;

-- Aggregate passport views across the caller's organization (partner dashboard). Count only.
create or replace function public.partner_passport_views()
returns bigint language sql stable security definer set search_path = public as $$
  select coalesce(sum(d.passport_views), 0)::bigint
  from public.devices d join public.donation_batches b on b.id = d.batch_id
  where b.organization_id = public.auth_org_id()
$$;

-- The certificate's device table: method, reference ID, verification date and the verifying
-- staff member. Only staff, or the owning organization once a certificate exists for the batch.
create or replace function public.certificate_devices(p_batch uuid)
returns table (
  category public.device_category, make text, model text, serial_number text, status public.device_status,
  wipe_method text, wipe_report_ref text, wipe_verified_at timestamptz, verified_by text
)
language sql stable security definer set search_path = public as $$
  select d.category, d.make, d.model, d.serial_number, d.status, d.wipe_method, d.wipe_report_ref, d.wipe_verified_at,
    nullif(trim(p.full_name), '')
  from public.devices d
  join public.donation_batches b on b.id = d.batch_id
  left join public.profiles p on p.id = d.wipe_verified_by
  where d.batch_id = p_batch
    and (public.is_staff() or (b.organization_id = public.auth_org_id() and exists (select 1 from public.certificates c where c.batch_id = b.id)))
  order by d.passport_code
$$;

revoke execute on function public.partner_passport_views() from public, anon;
revoke execute on function public.certificate_devices(uuid) from public, anon;
grant execute on function public.partner_passport_views(), public.certificate_devices(uuid) to authenticated;
grant execute on function public.public_settings(), public.verify_certificate(text) to anon, authenticated;
