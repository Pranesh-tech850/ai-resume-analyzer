import { useCallback, useState } from "react";
import { analyze } from "../lib/analyze.js";

// Runs the comparison on demand and keeps the latest result or error.
export function useAnalysis() {
  const [outcome, setOutcome] = useState({ result: null, error: "" });

  const run = useCallback((resumeText, jobDescription) => {
    try {
      setOutcome({ result: analyze(resumeText, jobDescription), error: "" });
    } catch (err) {
      setOutcome({ result: null, error: `Something went wrong while comparing: ${err.message}` });
    }
  }, []);

  return { ...outcome, run };
}
