import { useCallback, useState } from "react";
import { extractText } from "../lib/extractText.js";

// Owns the resume file: reads it, and tracks loading, success and error states.
export function useFileUpload() {
  const [state, setState] = useState({
    fileName: "",
    resumeText: "",
    status: "idle", // idle | loading | ready | error
    error: "",
  });

  const loadFile = useCallback(async (file) => {
    if (!file) return;
    setState({ fileName: file.name, resumeText: "", status: "loading", error: "" });
    try {
      const text = await extractText(file);
      if (!text.trim()) {
        throw new Error("No readable text found. If your PDF is a scanned image, upload a .docx or a text-based PDF.");
      }
      setState({ fileName: file.name, resumeText: text, status: "ready", error: "" });
    } catch (err) {
      setState({ fileName: "", resumeText: "", status: "error", error: err.message });
    }
  }, []);

  return { ...state, loadFile };
}
