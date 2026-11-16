const TAGS = {
  current: { label: "Current", className: "bg-accent-soft text-accent" },
  long: { label: "Long tenure", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" },
  short: { label: "Under 1 year", className: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300" },
  ok: null,
};

// The list of dated roles, each with its duration and an optional tag.
export default function StintTimeline({ stints }) {
  if (!stints.length) {
    return (
      <p className="mt-4 text-sm text-muted">
        No dated roles found. Use a format like "Jan 2021 - Mar 2023".
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-2 text-sm">
      {stints.map((s) => {
        const tag = TAGS[s.tag];
        return (
          <li
            key={s.label}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-page px-4 py-2"
          >
            <span className="font-medium text-ink">{s.label}</span>
            <span className="flex items-center gap-2 text-muted">
              <span>{s.duration}</span>
              {tag && <span className={`rounded-full px-2 py-0.5 text-xs ${tag.className}`}>{tag.label}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
