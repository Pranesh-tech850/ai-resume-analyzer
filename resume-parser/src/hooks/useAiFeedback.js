import { useCallback, useState } from "react";

// The proxy in backend/server.js, deployed on Render. To use a local proxy instead,
// set VITE_FEEDBACK_URL=http://localhost:3001/api/feedback in resume-parser/.env.local.
const FEEDBACK_URL =
  import.meta.env.VITE_FEEDBACK_URL || "https://ai-resume-analyzer-1-zh1k.onrender.com/api/feedback";

// Calls the backend proxy and keeps the reply, the remaining allowance, or an error.
export function useAiFeedback() {
  const [state, setState] = useState({
    status: "idle", // idle | loading | ready | error
    reply: "",
    percentLeft: null,
    error: "",
  });

  const requestFeedback = useCallback(async (resume, jobDescription) => {
    setState({ status: "loading", reply: "", percentLeft: null, error: "" });
    try {
      const res = await fetch(FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // The proxy sends a readable message in `error`. Fall back to a generic one.
        throw new Error(data.error || `The feedback server returned ${res.status}.`);
      }

      setState({ status: "ready", reply: data.reply, percentLeft: data.percentLeft, error: "" });
    } catch (err) {
      // fetch itself throws when the server isn't running, so say that plainly.
      const message =
        err instanceof TypeError
          ? "Could not reach the feedback server. Is it running? Start it with `npm start` in backend/."
          : err.message;
      setState({ status: "error", reply: "", percentLeft: null, error: message });
    }
  }, []);

  return { ...state, requestFeedback };
}
