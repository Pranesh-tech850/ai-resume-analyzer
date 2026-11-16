const TONES = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800",
  red: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-800",
  amber: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800",
  slate: "bg-track text-ink ring-line",
};

export default function Chip({ tone = "slate", children }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${TONES[tone]}`}>
      {children}
    </span>
  );
}
