// Reference data and patterns used by the analysis. Extend the lists to suit your field.

export const SKILLS = [
  "javascript", "typescript", "python", "java", "c#", "c++", "go", "rust", "ruby", "php",
  "sql", "html", "css", "react", "vue", "angular", "node.js", "express", "django", "flask",
  "spring", "tailwind", "git", "docker", "kubernetes", "aws", "azure", "gcp", "linux",
  "rest", "graphql", "mongodb", "postgresql", "mysql", "redis", "ci/cd", "testing", "jest",
  "agile", "scrum", "communication", "teamwork", "leadership", "problem solving",
  "data analysis", "machine learning", "excel", "tableau", "power bi", "figma",
  "product management", "stakeholder management", "project management",
];

export const ACTION_VERBS = [
  "built", "created", "designed", "developed", "implemented", "led", "managed", "improved",
  "increased", "reduced", "launched", "delivered", "automated", "optimized", "collaborated",
  "owned", "mentored", "analyzed", "migrated", "shipped",
];

export const SECTIONS = {
  Experience: /\b(experience|work history|employment)\b/i,
  Education: /\b(education|academic)\b/i,
  Skills: /\b(skills|technologies|tech stack)\b/i,
  Projects: /\b(projects|portfolio)\b/i,
};

export const STOPWORDS = new Set([
  "and", "the", "with", "for", "you", "your", "will", "our", "are", "have", "has", "this",
  "that", "from", "who", "what", "their", "they", "able", "must", "should", "work", "team",
  "role", "years", "year", "experience", "including", "such", "also", "strong", "knowledge",
  "ability", "good", "using", "use", "new", "etc", "plus", "about", "into", "across", "within",
  "we", "is", "in", "of", "to", "a", "an", "or", "as", "on", "be", "by", "at", "it", "if",
  "not", "can", "all", "more", "other", "least", "preferred", "required", "requirements",
  "responsibilities", "job", "candidate", "looking", "join", "build", "working",
]);

export const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
export const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/;
export const QUANT_RE =
  /(\d+(\.\d+)?\s*(%|x\b|\+|k\b|m\b|million|billion|users|customers|clients|projects|teams|members|engineers|hours|days|percent))|\$\s?\d/i;

// Matches "Jan 2020 - Mar 2022", "2019 - Present", "2018 to 2020", and similar.
const MONTH_PART = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s+";
export const DATE_RANGE_PATTERN =
  `((?:${MONTH_PART})?\\d{4})\\s*(?:-|–|—|to)\\s*((?:${MONTH_PART})?\\d{4}|present|current|now)`;
