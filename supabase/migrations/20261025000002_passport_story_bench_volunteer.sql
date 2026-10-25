-- Relay Wrapped: a device still on the bench names its assigned volunteer, only when
-- that volunteer opted in to attribution (VW-07). Everything else is unchanged.

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
  v_bench_name text;
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

  -- Still on the bench: name the assigned volunteer, only if they opted in (VW-07).
  if base->>'volunteer_first_name' is null and d.refurbished_by is null and d.status not in ('recycled', 'received') then
    select coalesce(nullif(p.display_first_name, ''), split_part(p.full_name, ' ', 1)) into v_bench_name
      from public.profiles p where p.id = d.assigned_volunteer_id and p.attribution_opt_in;
  end if;

  return base || jsonb_build_object(
    'offered_at', v_offered,
    'milestones', v_milestones,
    'steps_completed', v_steps,
    -- Whole days on the volunteer bench: first checklist step to the last one.
    'bench_days', case when v_first_step is null then null else greatest(0, ceil(extract(epoch from (v_last_step - v_first_step)) / 86400.0))::int end,
    'recycled', d.status = 'recycled',
    'volunteer_first_name', coalesce(base->>'volunteer_first_name', v_bench_name)
  );
end $$;
