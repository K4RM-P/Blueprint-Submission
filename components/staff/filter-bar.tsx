"use client";

import { Select } from "@/components/clay";

/** GET form of selects — works without JS, keeps URLs shareable. With JS, a select applies as soon as it changes. */
export function FilterBar({ filters, action, children }: { action: string; filters: { name: string; label: string; value: string; options: { value: string; label: string }[] }[]; children?: React.ReactNode }) {
  return (
    <form action={action} method="get" onChange={(e) => e.target instanceof HTMLSelectElement && e.currentTarget.requestSubmit()} className="glass mb-5 flex flex-wrap items-end gap-3 rounded-[var(--r-md)] p-3">
      {children}
      {filters.map((f) => (
        <label key={f.name} className="flex min-w-36 flex-col gap-1 text-small font-medium text-ink-2">
          {f.label}
          <Select name={f.name} defaultValue={f.value} className="!min-h-11 !text-[0.9375rem]">
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </label>
      ))}
      <button type="submit" data-tint="porcelain" className="clay-sm clay-press h-11 rounded-full px-5 font-semibold">
        Apply
      </button>
    </form>
  );
}
