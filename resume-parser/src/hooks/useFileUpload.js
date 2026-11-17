import { useCallback, useRef, useState } from "react";
import { extractText } from "../lib/extractText.js";

// Owns the resume file: reads it, and tracks loading, success and error states.
export function useFileUpload() {
  const [state, setState] = useState({
    fileName: "",
    resumeText: "",
    status: "idle", // idle | loading | ready | error
    error: "",
  });
  // Counts each upload. A read that finishes after a newer upload has started is ignored.
  const latestUpload = useRef(0);

  const loadFile = useCallback(async (file) => {
    if (!file) return;
    const uploadId = ++latestUpload.current;
    setState({ fileName: file.name, resumeText: "", status: "loading", error: "" });
    try {
      const text = await extractText(file);
      if (uploadId !== latestUpload.current) return;
      if (!text.trim()) {
        throw new Error("No readable text found. If your PDF is a scanned image, upload a .docx or a text-based PDF.");
      }
      setState({ fileName: file.name, resumeText: text, status: "ready", error: "" });
    } catch (err) {
      if (uploadId !== latestUpload.current) return;
      setState({ fileName: "", resumeText: "", status: "error", error: err.message });
    }
  }, []);

  return { ...state, loadFile };
}
