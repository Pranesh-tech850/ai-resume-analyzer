import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import ErrorMessage from "../ui/ErrorMessage.jsx";
import ChipList from "../ui/ChipList.jsx";
import { useHistory } from "../../hooks/useHistory.js";

function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// One saved analysis: score, date, and the skills it found missing.
function HistoryRow({ item }) {
  return (
    <li className="rounded-xl bg-page p-4 ring-1 ring-line">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-extrabold text-ink">{item.score}</span>
          <span className="text-sm text-muted">/ 100 · {item.verdict}</span>
        </div>
        <span className="text-xs text-muted">{formatDate(item.createdAt)}</span>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Missing skills</p>
        <ChipList items={item.skillsMissing} tone="red" emptyText="Nothing missing" />
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Skills you have</p>
        <ChipList items={item.skillsMatched} tone="green" emptyText="None found" />
      </div>
    </li>
  );
}

// Shows saved analyses. It loads only when the user asks, so visiting the page costs nothing.
export default function History() {
  const history = useHistory();

  return (
    <Card title="Your history" subtitle="Scores and skill gaps from your past analyses. The resume and job text are not stored.">
      <div className="mt-4 flex flex-col items-start gap-3">
        <Button disabled={history.status === "loading"} onClick={history.loadHistory}>
          {history.status === "loading" ? "Loading..." : "Load history"}
        </Button>
        <ErrorMessage message={history.error} />
      </div>

      {history.status === "ready" && history.items.length === 0 && (
        <p className="mt-4 text-sm text-muted">No saved analyses yet.</p>
      )}

      {history.status === "ready" && history.items.length > 0 && (
        <ul className="mt-4 space-y-3">
          {history.items.map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Card>
  );
}
