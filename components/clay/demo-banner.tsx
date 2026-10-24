/** Thin butter strip on every page in demo mode (AUTH-06, §8). */
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;
  return (
    <div role="note" className="no-print bg-butter px-4 py-1.5 text-center text-[0.8125rem] font-medium text-[#5c4300]">
      Demo environment · fictional data
    </div>
  );
}
