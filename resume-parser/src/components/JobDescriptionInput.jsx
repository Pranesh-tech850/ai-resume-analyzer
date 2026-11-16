import Card from "./ui/Card.jsx";

// Step 2: the job description text box. Controlled by the parent so the Analyze button can read it.
export default function JobDescriptionInput({ value, onChange }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-ink">2. Paste the job description</h2>
      <p className="mt-1 text-sm text-muted">Copy the full posting, including requirements.</p>
      <textarea
        rows={11}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="We are looking for a frontend developer with 3+ years of experience in JavaScript, React and Tailwind CSS..."
        className="mt-4 w-full rounded-xl border border-line bg-page p-3 text-sm leading-relaxed text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </Card>
  );
}
