// A circular gauge with the score in the middle. The ring fill is a CSS conic gradient
// that reads the theme colours, so it switches with light and dark mode.
export default function ScoreRing({ score }) {
  return (
    <div
      className="flex h-32 w-32 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(var(--accent) ${score * 3.6}deg, var(--track) 0deg)` }}
      role="img"
      aria-label={`Score ${score} out of 100`}
    >
      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-panel">
        <span className="text-3xl font-extrabold text-ink">{score}</span>
        <span className="text-xs text-muted">out of 100</span>
      </div>
    </div>
  );
}
