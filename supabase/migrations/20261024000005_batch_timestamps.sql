-- Timestamps for every batch status so the partner timeline (PP-06) can show dates.
alter table public.donation_batches
  add column approved_at timestamptz,
  add column scheduled_at timestamptz,
  add column declined_at timestamptz;

create or replace function public.stamp_batch_status()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from coalesce(old.status, 'submitted'::public.batch_status) or tg_op = 'INSERT' then
    if new.status in ('approved', 'scheduled', 'received', 'in_refurbishment', 'completed') and new.approved_at is null then new.approved_at := now(); end if;
    if new.status in ('scheduled', 'received', 'in_refurbishment', 'completed') and new.scheduled_at is null then new.scheduled_at := now(); end if;
    if new.status = 'declined' and new.declined_at is null then new.declined_at := now(); end if;
  end if;
  return new;
end $$;

create trigger batches_stamp before insert or update on public.donation_batches
  for each row execute function public.stamp_batch_status();
