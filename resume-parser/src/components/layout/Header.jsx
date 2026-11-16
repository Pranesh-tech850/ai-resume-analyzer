import ThemeToggle from "../ui/ThemeToggle.jsx";

export default function Header() {
  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <span className="text-lg font-bold text-accent">ResumeParser</span>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted sm:inline">Runs entirely in your browser</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
