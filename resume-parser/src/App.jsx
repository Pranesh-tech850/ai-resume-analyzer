import { useEffect, useState } from "react";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import Hero from "./components/Hero.jsx";
import ResumeUploader from "./components/ResumeUploader.jsx";
import JobDescriptionInput from "./components/JobDescriptionInput.jsx";
import ScoreCard from "./components/scorecard/ScoreCard.jsx";
import History from "./components/history/History.jsx";
import Button from "./components/ui/Button.jsx";
import ErrorMessage from "./components/ui/ErrorMessage.jsx";
import { useFileUpload } from "./hooks/useFileUpload.js";
import { useAnalysis } from "./hooks/useAnalysis.js";
import { saveAnalysis } from "./lib/saveAnalysis.js";

export default function App() {
  const upload = useFileUpload();
  const analysis = useAnalysis();
  const [jobDescription, setJobDescription] = useState("");

  // Each new result is saved once, when it appears.
  useEffect(() => {
    if (analysis.result) saveAnalysis(analysis.result);
  }, [analysis.result]);

  const canAnalyze = upload.status === "ready" && jobDescription.trim().length > 0;
  const error = upload.error || analysis.error;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Hero />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 lg:grid-cols-2">
          <ResumeUploader
            status={upload.status}
            fileName={upload.fileName}
            onFile={upload.loadFile}
          />
          <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-10">
          <div className="flex flex-col items-center gap-3">
            <Button
              disabled={!canAnalyze}
              onClick={() => analysis.run(upload.resumeText, jobDescription)}
            >
              Compare and score
            </Button>
            <ErrorMessage message={error} />
          </div>
        </section>

        {analysis.result && (
          <ScoreCard
            result={analysis.result}
            resume={upload.resumeText}
            jobDescription={jobDescription}
          />
        )}

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <History />
        </section>
      </main>

      <Footer />
    </div>
  );
}
