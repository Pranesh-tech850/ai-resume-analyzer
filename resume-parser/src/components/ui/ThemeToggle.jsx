import { useTheme } from "../../hooks/useTheme.js";

// A round button that switches between light (cream) and dark (black) mode.
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const nextMode = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-page text-lg text-ink transition hover:border-accent hover:text-accent"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
