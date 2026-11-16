// The comparison engine. Pure functions with no DOM access, so it can be tested in Node.
import {
  ACTION_VERBS,
  DATE_RANGE_PATTERN,
  EMAIL_RE,
  MONTHS,
  PHONE_RE,
  QUANT_RE,
  SECTIONS,
  SKILLS,
  STOPWORDS,
} from "./referenceData.js";

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Lookarounds stop "java" from matching inside "javascript", and work for "c#" and "c++".
function skillRegex(skill) {
  return new RegExp(`(?<![a-z0-9])${escapeRegex(skill)}(?![a-z0-9])`, "i");
}

function tokens(text) {
  return text.toLowerCase().match(/[a-z][a-z0-9+#]{2,}/g) || [];
}

function topKeywords(text, limit) {
  const counts = new Map();
  for (const word of tokens(text)) {
    if (STOPWORDS.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function maxYears(text) {
  let max = 0;
  for (const m of text.matchAll(/(\d{1,2})\s*\+?\s*(?:years|yrs)/gi)) {
    max = Math.max(max, Number(m[1]));
  }
  return max;
}

// Turns "Mar 2021" or "2019" into a month count since year 0, so ranges can be subtracted.
function monthIndex(s) {
  const year = s.match(/\d{4}/);
  if (!year) return null;
  const month = s.toLowerCase().match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  const offset = month ? MONTHS.indexOf(month[1]) : 0;
  return Number(year[0]) * 12 + offset;
}

export function parseStints(text) {
  const now = new Date();
  const nowIndex = now.getFullYear() * 12 + now.getMonth();
  const stints = [];
  for (const m of text.matchAll(new RegExp(DATE_RANGE_PATTERN, "gi"))) {
    const start = monthIndex(m[1]);
    const isCurrent = /present|current|now/i.test(m[2]);
    const end = isCurrent ? nowIndex : monthIndex(m[2]);
    if (start == null || end == null || end < start) continue;
    stints.push({
      label: m[0].trim(),
      start,
      end,
      months: Math.max(1, end - start),
      current: isCurrent,
    });
  }
  return stints;
}

export function formatDuration(totalMonths) {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (months || !years) parts.push(`${months} mo${months !== 1 ? "s" : ""}`);
  return parts.join(" ");
}

export function analyze(resume, jd) {
  // Skills named in the job, and which of them the resume shows.
  const jdSkills = SKILLS.filter((s) => skillRegex(s).test(jd));
  const resumeSkills = SKILLS.filter((s) => skillRegex(s).test(resume));
  const skillsMatched = jdSkills.filter((s) => resumeSkills.includes(s));
  const skillsMissing = jdSkills.filter((s) => !resumeSkills.includes(s));
  const extraSkills = resumeSkills.filter((s) => !jdSkills.includes(s));

  // Words the job repeats, and whether the resume uses them.
  const resumeTokens = new Set(tokens(resume));
  const jdKeywords = topKeywords(jd, 20);
  const kwMatched = jdKeywords.filter((k) => resumeTokens.has(k));
  const kwMissing = jdKeywords.filter((k) => !resumeTokens.has(k));

  // Experience: stated years, or the span covered by the dated roles.
  const stints = parseStints(resume);
  const span = stints.length
    ? (Math.max(...stints.map((s) => s.end)) - Math.min(...stints.map((s) => s.start))) / 12
    : 0;
  const jdYears = maxYears(jd);
  const resumeYears = maxYears(resume) || Math.floor(span * 10) / 10;

  // Resume quality checks.
  const hasEmail = EMAIL_RE.test(resume);
  const hasPhone = PHONE_RE.test(resume);
  const sectionsFound = Object.keys(SECTIONS).filter((name) => SECTIONS[name].test(resume));
  const quantLines = resume.split("\n").filter((line) => QUANT_RE.test(line)).length;
  const verbsFound = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(resume));
  const wordCount = resume.trim().split(/\s+/).filter(Boolean).length;

  // Points per category. They add up to 100.
  const keywordRatio = jdKeywords.length ? kwMatched.length / jdKeywords.length : 0;
  const skillRatio = jdSkills.length ? skillsMatched.length / jdSkills.length : null;
  const skillPts = Math.round(40 * (skillRatio ?? keywordRatio)); // falls back to keywords if no skills were named
  const keywordPts = Math.round(25 * keywordRatio);
  const expPts = jdYears ? Math.round(15 * Math.min(resumeYears / jdYears, 1)) : 15;
  const contactPts = (hasEmail ? 3 : 0) + (hasPhone ? 2 : 0);
  const sectionPts = Math.round((5 * sectionsFound.length) / Object.keys(SECTIONS).length);
  const quantPts = Math.min(5, quantLines);
  const verbPts = Math.min(5, verbsFound.length);
  const qualityPts = contactPts + sectionPts + quantPts + verbPts;
  const score = Math.min(100, skillPts + keywordPts + expPts + qualityPts);

  // Employment timeline: gaps, short stints and long tenures.
  const sorted = [...stints].sort((a, b) => b.start - a.start);
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i].start - sorted[i + 1].end;
    if (gap > 6) gaps.push(`${formatDuration(gap)} between "${sorted[i + 1].label}" and "${sorted[i].label}"`);
  }
  const shortStints = stints.filter((s) => s.months < 12 && !s.current);
  const longest = stints.reduce((best, s) => (s.months > (best?.months ?? 0) ? s : best), null);

  // Strengths and weaknesses, written as sentences.
  const strengths = [];
  const weaknesses = [];

  if (skillsMatched.length) strengths.push(`Matches ${skillsMatched.length} of the ${jdSkills.length} skills the job names.`);
  if (extraSkills.length) strengths.push(`Brings extra skills the job doesn't mention: ${extraSkills.slice(0, 5).join(", ")}.`);
  if (hasEmail && hasPhone) strengths.push("Contact details are complete.");
  if (sectionsFound.length === Object.keys(SECTIONS).length) strengths.push("All standard sections are present.");
  if (quantLines >= 3) strengths.push(`${quantLines} lines include measurable results.`);
  if (verbsFound.length >= 5) strengths.push("Uses strong action verbs.");
  if (jdYears && resumeYears >= jdYears) strengths.push(`Meets the ${jdYears}+ years of experience the job asks for.`);
  if (longest && longest.months >= 24) strengths.push(`Longest role lasted ${formatDuration(longest.months)}, which shows staying power.`);

  if (skillsMissing.length) weaknesses.push(`Missing ${skillsMissing.length} required skill${skillsMissing.length > 1 ? "s" : ""}: ${skillsMissing.slice(0, 6).join(", ")}.`);
  if (!hasEmail) weaknesses.push("No email address found.");
  if (!hasPhone) weaknesses.push("No phone number found.");
  const missingSections = Object.keys(SECTIONS).filter((n) => !sectionsFound.includes(n));
  if (missingSections.length) weaknesses.push(`No clear ${missingSections.join(", ")} section${missingSections.length > 1 ? "s" : ""} found.`);
  if (quantLines < 3) weaknesses.push("Few measurable results. Add numbers such as percentages, users or time saved.");
  if (verbsFound.length < 3) weaknesses.push("Few action verbs. Start bullets with words like \"built\" or \"improved\".");
  if (jdYears && resumeYears < jdYears) weaknesses.push(`About ${resumeYears} years of experience shown against ${jdYears}+ asked for.`);
  if (shortStints.length >= 2) weaknesses.push(`${shortStints.length} roles lasted under a year, which may read as frequent job changes.`);
  for (const g of gaps) weaknesses.push(`Unexplained gap: ${g}.`);
  if (wordCount < 200) weaknesses.push("The resume is very short. Add more detail on responsibilities and results.");
  if (wordCount > 900) weaknesses.push("The resume is long. Aim for one to two pages, focusing on recent work.");

  // Suggestions: concrete next steps.
  const suggestions = [];
  for (const skill of skillsMissing.slice(0, 4)) {
    suggestions.push(`If you have used ${skill}, name it in your skills section and show it in a project or role. If not, consider learning it before applying.`);
  }
  if (quantLines < 3) suggestions.push("Rewrite two or three bullets with a number each, for example \"cut page load time by 40%\".");
  if (!hasEmail || !hasPhone) suggestions.push("Put your email and phone number at the top, where recruiters look first.");
  if (kwMissing.length) suggestions.push(`Work these terms into your bullets where they're true: ${kwMissing.slice(0, 6).join(", ")}.`);
  if (!suggestions.length) suggestions.push("Solid match. Tailor the top summary to this specific role before you apply.");

  const verdict =
    score >= 80 ? "Strong match" :
    score >= 60 ? "Good match, some gaps" :
    score >= 40 ? "Partial match" :
    "Weak match";

  return {
    score,
    verdict,
    categories: [
      { name: "Skills", value: skillPts, max: 40 },
      { name: "Keywords", value: keywordPts, max: 25 },
      { name: "Experience", value: expPts, max: 15 },
      { name: "Resume quality", value: qualityPts, max: 20 },
    ],
    skillsMatched,
    skillsMissing,
    extraSkills,
    kwMissing,
    strengths,
    weaknesses,
    stints: sorted.map((s) => ({
      label: s.label,
      duration: formatDuration(s.months),
      tag: s.current ? "current" : s.months < 12 ? "short" : s.months >= 24 ? "long" : "ok",
    })),
    suggestions,
    meta: `${wordCount} words · ${resumeYears ? resumeYears + " yrs stated or detected" : "no years detected"}`,
  };
}
