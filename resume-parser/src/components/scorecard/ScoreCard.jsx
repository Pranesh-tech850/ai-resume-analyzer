import Card from "../ui/Card.jsx";
import ScoreRing from "./ScoreRing.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import SkillsPanel from "./SkillsPanel.jsx";
import BulletList from "../ui/BulletList.jsx";
import StintTimeline from "./StintTimeline.jsx";
import AiFeedback from "./AiFeedback.jsx";

// The full results view. It receives the analysis result and only lays it out.
export default function ScoreCard({ result, resume, jobDescription }) {
  return (
    <section className="mx-auto max-w-6xl animate-fade-up space-y-6 px-6 pb-16">
      <Card className="flex flex-col items-center gap-6 p-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-6">
          <ScoreRing score={result.score} />
          <div>
            <p className="text-sm uppercase tracking-wide text-muted">Overall match</p>
            <p className="text-2xl font-bold text-ink">{result.verdict}</p>
            <p className="mt-1 text-sm text-muted">{result.meta}</p>
          </div>
        </div>
        <div className="w-full space-y-3 md:w-96">
          {result.categories.map((c) => (
            <ProgressBar key={c.name} label={c.name} value={c.value} max={c.max} />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <SkillsPanel
          title="Skills you have"
          titleTone="text-emerald-700 dark:text-emerald-400"
          items={result.skillsMatched}
          tone="green"
          emptyText="None of the named skills found"
          secondary={{
            title: "Other skills on your resume",
            items: result.extraSkills,
            tone: "slate",
            emptyText: "None detected",
          }}
        />
        <SkillsPanel
          title="Skills the job asks for that you're missing"
          titleTone="text-red-700 dark:text-red-400"
          items={result.skillsMissing}
          tone="red"
          emptyText="Nothing missing. Nice."
          secondary={{
            title: "Important keywords not on your resume",
            items: result.kwMissing,
            tone: "amber",
            emptyText: "All key terms covered",
            titleTone: "text-amber-700 dark:text-amber-400",
          }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Strengths</h3>
          <BulletList items={result.strengths} emptyText="No clear strengths detected yet." />
        </Card>
        <Card>
          <h3 className="font-semibold text-red-700 dark:text-red-400">Weaknesses</h3>
          <BulletList items={result.weaknesses} emptyText="No major weaknesses detected." />
        </Card>
      </div>

      <Card title="Employment timeline" subtitle="Dates are detected automatically, so an education date range may appear here too.">
        <StintTimeline stints={result.stints} />
      </Card>

      <Card tone="accent">
        <h3 className="font-semibold text-accent">What to do next</h3>
        <BulletList items={result.suggestions} emptyText="No suggestions." ordered />
      </Card>

      <AiFeedback resume={resume} jobDescription={jobDescription} />
    </section>
  );
}
