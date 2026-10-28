-- B6/PRD §19: never default a wipe to a named standard Free Geek Toronto hasn't confirmed.
-- The app already passes the method explicitly (lib/domain DEFAULT_WIPE_METHOD); this only changes the fallback.
do $$
declare
  src text;
begin
  select pg_get_functiondef('public.complete_step(uuid, public.checklist_step, text, text, text, boolean, text)'::regprocedure) into src;
  src := replace(src, '''NIST 800-88 Purge (software overwrite)''', '''FGT data-sanitization software (standard to be confirmed)''');
  execute src;
end $$;
