import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "resume-parser-theme";

// The head script in index.html sets the first theme before paint. This hook reads that
// result, applies changes, and remembers the choice for the next visit.
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked (private mode). The theme still works for this visit.
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    []
  );

  return { theme, toggleTheme };
}
