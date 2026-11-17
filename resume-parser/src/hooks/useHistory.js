import { useCallback, useState } from "react";

// Same backend as useAiFeedback. Override with VITE_BACKEND_URL if it moves.
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://ai-resume-analyzer-9-75w5.onrender.com";

// Loads the saved analyses from the backend and keeps the list or an error.
export function useHistory() {
  const [state, setState] = useState({
    status: "idle", // idle | loading | ready | error
    items: [],
    error: "",
  });

  const loadHistory = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: "" }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/analyses`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `The history server returned ${res.status}.`);
      }
      setState({ status: "ready", items: data.items ?? [], error: "" });
    } catch (err) {
      const message =
        err instanceof TypeError
          ? "Could not reach the backend to load history."
          : err.message;
      setState({ status: "error", items: [], error: message });
    }
  }, []);

  return { ...state, loadHistory };
}
