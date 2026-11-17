// Same backend as the other hooks. Override with VITE_BACKEND_URL if it moves.
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "https://ai-resume-analyzer-9-75w5.onrender.com";

// Sends one scorecard result to the backend so it lands in MongoDB.
// The backend keeps only the fields it whitelists (see backend/analysisStore.js),
// so the resume and job text are never stored. Saving is best-effort: if it fails,
// the scorecard still shows, and we only log the reason.
export async function saveAnalysis(result) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/analyses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn("Analysis not saved:", data.error || res.status);
    }
  } catch (err) {
    console.warn("Analysis not saved, backend unreachable:", err.message);
  }
}
