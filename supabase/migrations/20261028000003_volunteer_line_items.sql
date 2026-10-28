-- B5/VW-04: a volunteer's Skills Wallet estimates hours with the same uniform-vs-mixed rule as the
-- impact engine, which needs the line-item quantity of devices they worked on. Volunteers may read
-- only the line items of devices assigned to or refurbished by them (make, model, quantity: no PII).
create policy line_items_select_volunteer on public.batch_line_items for select to authenticated
  using (
    public.auth_role() = 'volunteer'
    and exists (
      select 1 from public.devices d
      where d.line_item_id = batch_line_items.id
        and (d.assigned_volunteer_id = auth.uid() or d.refurbished_by = auth.uid())
    )
  );
