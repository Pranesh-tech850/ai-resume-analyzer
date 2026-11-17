// Decides what an analysis is allowed to store. Only fields listed here are kept,
// and every value is checked and length-limited before it reaches the database.
//
// Deliberately NOT stored: the resume text, the job description text, names, emails,
// phone numbers, addresses, IP addresses, and the labd API key. Scores and skill lists
// are enough to track progress without keeping anyone's personal data.

const MAX_TEXT = 300;   // longest single sentence or skill name we keep
const MAX_LIST = 30;    // most items we keep in any one list

function cleanText(value, max = MAX_TEXT) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, MAX_LIST)
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function cleanInt(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function cleanCategories(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 10).flatMap((c) => {
    const name = cleanText(c?.name, 60);
    const v = cleanInt(c?.value, 0, 100);
    const max = cleanInt(c?.max, 1, 100);
    return name && v !== null && max !== null ? [{ name, value: v, max }] : [];
  });
}

// Returns the document to store, or null if the score is missing or invalid.
export function sanitizeAnalysis(input) {
  const score = cleanInt(input?.score, 0, 100);
  if (score === null) return null;

  return {
    score,
    verdict: cleanText(input.verdict, 60),
    categories: cleanCategories(input.categories),
    skillsMatched: cleanList(input.skillsMatched),
    skillsMissing: cleanList(input.skillsMissing),
    extraSkills: cleanList(input.extraSkills),
    keywordsMissing: cleanList(input.kwMissing),
    strengths: cleanList(input.strengths),
    weaknesses: cleanList(input.weaknesses),
    suggestions: cleanList(input.suggestions),
    createdAt: new Date(),
  };
}

export async function saveAnalysis(db, doc) {
  const { insertedId } = await db.collection("analyses").insertOne(doc);
  return insertedId;
}
