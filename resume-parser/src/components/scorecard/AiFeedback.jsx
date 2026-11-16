import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import ErrorMessage from "../ui/ErrorMessage.jsx";
import { useAiFeedback } from "../../hooks/useAiFeedback.js";

// Asks the backend for written feedback and shows the reply as paragraphs.
export default function AiFeedback({ resume, jobDescription }) {
  const feedback = useAiFeedback();
  const paragraphs = feedback.reply.split(/\n\s*\n/).filter(Boolean);

  return (
    <Card title="Written feedback" subtitle="A short coach-style review from labd, based on this resume and job description.">
      <div className="mt-4 flex flex-col items-start gap-3">
        <Button
          disabled={feedback.status === "loading"}
          onClick={() => feedback.requestFeedback(resume, jobDescription)}
        >
          {feedback.status === "loading" ? "Writing feedback..." : "Get AI feedback"}
        </Button>
        <ErrorMessage message={feedback.error} />
      </div>

      {feedback.status === "ready" && (
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {feedback.percentLeft != null && (
            <p className="pt-2 text-xs text-muted">{feedback.percentLeft}% of your labd allowance left.</p>
          )}
        </div>
      )}
    </Card>
  );
}
