-- Relay Wrapped: the passport story (DP-02…DP-06, PIF-06).
--
-- 1. get_passport_story(code): everything get_passport() returns, plus ordered, public-safe
--    journey milestones derived from device_events. Dates only: no actors, no notes,
--    no metadata, no serials, no wipe report IDs, no recipient, no price (DP-05).
-- 2. Anonymous, aggregate story analytics (counts only, no PII, no device link).

-- ---------------------------------------------------------------- 1. story RPC
create or replace function public.get_passport_story(p_code text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  base jsonb;
  d public.devices;
  v_offered timestamptz;
  v_milestones jsonb;
  v_steps jsonb;
  v_first_step timestamptz;
  v_last_step timestamptz;
begin
  -- Reuses get_passport(): same opt-in rules, counts the view exactly once.
  base := public.get_passport(p_code);
  if base is null then return null; end if;
  select * into d from public.devices where passport_code = upper(trim(p_code));

  -- When the business offered the batch (submitted). Partner devices only.
  if d.batch_id is not null then
    select created_at into v_offered from public.donation_batches where id = d.batch_id;
  end if;

  -- First time each public milestone happened, oldest first.
  select coalesce(jsonb_agg(jsonb_build_object('kind', kind, 'at', at) order by at), '[]'::jsonb)
    into v_milestones
  from (
    select kind, min(created_at) as at from (
      select e.created_at,
        case
          when e.event_type = 'step_completed' then e.step::text
          when e.event_type = 'status_change' and e.to_status in ('received', 'wipe_verified', 'ready', 'listed', 'sold', 'recycled') then e.to_status::text
        end as kind
      from public.device_events e
      where e.device_id = d.id
    ) x
    where kind is not null
    group by kind
  ) m;

  select coalesce(jsonb_agg(distinct e.step::text), '[]'::jsonb), min(e.created_at), max(e.created_at)
    into v_steps, v_first_step, v_last_step
  from public.device_events e
  where e.device_id = d.id and e.event_type = 'step_completed';

  return base || jsonb_build_object(
    'offered_at', v_offered,
    'milestones', v_milestones,
    'steps_completed', v_steps,
    -- Whole days on the volunteer bench: first checklist step to the last one.
    'bench_days', case when v_first_step is null then null else greatest(0, ceil(extract(epoch from (v_last_step - v_first_step)) / 86400.0))::int end,
    'recycled', d.status = 'recycled'
  );
end $$;

-- ---------------------------------------------------------------- 2. story analytics
create table if not exists public.passport_story_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('start', 'complete', 'share', 'drop')),
  -- Slide key (e.g. "erased"), never a code or anything personal.
  slide text check (slide is null or slide ~ '^[a-z_]{1,24}$')
);
create index if not exists passport_story_events_kind_idx on public.passport_story_events (kind, slide);

alter table public.passport_story_events enable row level security;
drop policy if exists passport_story_staff_read on public.passport_story_events;
create policy passport_story_staff_read on public.passport_story_events for select to authenticated using (public.is_staff());

-- The only write path: a validated, anonymous insert.
create or replace function public.log_passport_story(p_kind text, p_slide text)
returns void language plpgsql volatile security definer set search_path = public as $$
begin
  if p_kind not in ('start', 'complete', 'share', 'drop') then raise exception 'Unknown story event'; end if;
  if p_slide is not null and p_slide !~ '^[a-z_]{1,24}$' then raise exception 'Unknown slide'; end if;
  insert into public.passport_story_events (kind, slide) values (p_kind, p_slide);
end $$;

-- Staff overview card: totals plus drop-offs by slide.
create or replace function public.passport_story_summary()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'Only staff can see passport engagement'; end if;
  return jsonb_build_object(
    'starts', (select count(*) from public.passport_story_events where kind = 'start'),
    'completions', (select count(*) from public.passport_story_events where kind = 'complete'),
    'shares', (select count(*) from public.passport_story_events where kind = 'share'),
    'drops', coalesce((
      select jsonb_agg(jsonb_build_object('slide', slide, 'count', n) order by n desc)
      from (select slide, count(*) as n from public.passport_story_events where kind = 'drop' and slide is not null group by slide) s
    ), '[]'::jsonb)
  );
end $$;

revoke all on function public.passport_story_summary() from public, anon;
grant execute on function public.get_passport_story(text), public.log_passport_story(text, text) to anon, authenticated;
grant execute on function public.passport_story_summary() to authenticated;
