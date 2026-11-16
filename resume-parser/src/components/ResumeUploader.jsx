import Card from "./ui/Card.jsx";
import { useDropzone } from "../hooks/useDropzone.js";

const STATUS_TEXT = {
  idle: () => "",
  loading: (name) => `Reading ${name}...`,
  ready: (name) => `Loaded ${name}`,
  error: () => "",
};

// Step 1: the drag-and-drop zone for the resume file.
export default function ResumeUploader({ status, fileName, onFile }) {
  const { isDragging, dropzoneProps, inputProps } = useDropzone({ onFile });
  const statusText = STATUS_TEXT[status](fileName);

  return (
    <Card>
      <h2 className="text-base font-semibold text-ink">1. Upload your resume</h2>
      <p className="mt-1 text-sm text-muted">PDF or .docx, up to 10 MB.</p>

      <div
        {...dropzoneProps}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition focus:outline-none focus:ring-2 focus:ring-accent ${
          isDragging
            ? "border-accent bg-accent-soft"
            : "border-line bg-page hover:border-accent"
        }`}
      >
        <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
        </svg>
        <p className="mt-3 font-medium text-ink">Drag and drop your resume here</p>
        <p className="text-sm text-muted">
          or <span className="font-semibold text-accent">click to browse</span>
        </p>
      </div>

      <input {...inputProps} accept=".pdf,.docx" />
      <p className="mt-3 min-h-[1.25rem] text-sm text-muted">{statusText}</p>
    </Card>
  );
}
