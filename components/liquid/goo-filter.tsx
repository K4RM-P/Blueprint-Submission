/** SVG gooey-merge filter (§7.2.1). Apply only to small indicator layers, never text. */
export function GooFilter({ id = "goo" }: { id?: string }) {
  return (
    <svg aria-hidden width="0" height="0" className="absolute" focusable="false">
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
