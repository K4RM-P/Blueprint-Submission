-- Storage buckets (KICKOFF Stage 1, task 4). Object paths start with the organization id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 1048576, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('certificates', 'certificates', false, 5242880, array['application/pdf']),
  ('reports', 'reports', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- logos: public read; partners write inside their org folder; staff anywhere.
create policy logos_read on storage.objects for select to anon, authenticated using (bucket_id = 'logos');
create policy logos_write on storage.objects for insert to authenticated
  with check (bucket_id = 'logos' and (public.is_staff() or (storage.foldername(name))[1] = public.auth_org_id()::text));
create policy logos_update on storage.objects for update to authenticated
  using (bucket_id = 'logos' and (public.is_staff() or (storage.foldername(name))[1] = public.auth_org_id()::text));
create policy logos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'logos' and (public.is_staff() or (storage.foldername(name))[1] = public.auth_org_id()::text));

-- certificates: private; partner reads own org's files; staff reads and writes all.
create policy certificates_read on storage.objects for select to authenticated
  using (bucket_id = 'certificates' and (public.is_staff() or (storage.foldername(name))[1] = public.auth_org_id()::text));
create policy certificates_write on storage.objects for insert to authenticated
  with check (bucket_id = 'certificates' and public.is_staff());
create policy certificates_update on storage.objects for update to authenticated
  using (bucket_id = 'certificates' and public.is_staff());

-- reports: private; partner reads/writes own org folder; staff all.
create policy reports_read on storage.objects for select to authenticated
  using (bucket_id = 'reports' and (public.is_staff() or (storage.foldername(name))[1] = public.auth_org_id()::text));
create policy reports_write on storage.objects for insert to authenticated
  with check (bucket_id = 'reports' and (public.is_staff() or (storage.foldername(name))[1] = public.auth_org_id()::text));
