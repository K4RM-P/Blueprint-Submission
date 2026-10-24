"use client";

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  className?: string;
  required?: boolean;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Label always visible above; hint and error tied via aria-describedby (§8, §11). */
export function Field({ label, hint, error, className, required, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.9375rem] font-medium text-ink">
        {label}
        {required ? <span className="text-ink-3"> (required)</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="-mt-0.5 text-small text-ink-2">
          {hint}
        </p>
      ) : null}
      <div key={error ? `e-${error}` : "ok"} className={error ? "shake" : undefined}>
        {children({ id, describedBy, invalid: Boolean(error) })}
      </div>
      {error ? (
        <p id={errId} role="alert" className="text-small font-medium text-danger-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentPropsWithoutRef<"input">>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("field-input", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentPropsWithoutRef<"textarea">>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("field-input", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<"select">>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn("field-input appearance-none pr-11", className)} {...props}>
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-ink-2">
        <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label: ReactNode;
  description?: ReactNode;
}

/** Clay pebble on a well; liquid green fill when checked (§8). */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, description, className, id: idProp, ...props }, ref) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <span className="relative mt-0.5 grid size-7 shrink-0 place-items-center">
        <input ref={ref} id={id} type="checkbox" className="peer well absolute inset-0 size-7 cursor-pointer appearance-none rounded-[9px] checked:bg-loop checked:shadow-[inset_-3px_-3px_6px_rgba(0,0,0,.18),inset_3px_3px_6px_rgba(255,255,255,.35)]" {...props} />
        <Check aria-hidden className="pointer-events-none relative size-4 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
      </span>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block font-medium text-ink">{label}</span>
        {description ? <span className="block text-small text-ink-2">{description}</span> : null}
      </label>
    </div>
  );
});
