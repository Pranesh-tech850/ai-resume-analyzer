import { useAnimatedPercent } from "../../hooks/useAnimatedPercent.js";

// A labelled bar that animates from 0 to its value on mount.
export default function ProgressBar({ label, value, max }) {
  const percent = Math.round((value / max) * 100);
  const animated = useAnimatedPercent(percent);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-muted">
          {value} / {max}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${animated}%` }}
        />
      </div>
    </div>
  );
}
