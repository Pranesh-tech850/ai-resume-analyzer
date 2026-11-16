// A panel with a soft border and shadow. Used everywhere a section sits on the page.
export default function Card({ title, subtitle, tone = "panel", className = "", children }) {
  const tones = {
    panel: "bg-panel ring-line",
    accent: "bg-accent-soft ring-line",
  };
  return (
    <div className={`rounded-2xl p-6 shadow-sm ring-1 ${tones[tone]} ${className}`}>
      {title && <h3 className="font-semibold text-ink">{title}</h3>}
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}
