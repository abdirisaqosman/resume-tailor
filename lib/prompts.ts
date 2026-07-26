import { localeOutputLanguage, type Locale } from "@/i18n/config";

const BASE_SYSTEM_PROMPT = `You are an expert resume writer and career coach. Given a candidate's master resume and a target job description, you:
1. Restructure the resume into clean sections (e.g. Experience, Skills, Education, Projects — whatever the original resume actually has), rewriting each entry to emphasize what's most relevant to the job description, without fabricating anything not present in the original resume.
2. Write a concise, tailored cover letter (3-4 paragraphs) connecting the candidate's background to the specific role and company context found in the job description.
Keep sections in the same order as the original resume. Preserve factual details (dates, employers, titles, metrics) exactly as given. Bullets should be short, punchy, achievement-focused lines — not full paragraphs.`;

const ARABIC_GUIDANCE = `Write natural, professional Arabic — do not translate word-for-word from English. Keep proper nouns (employer names, product names, universities), technology names, and acronyms in their original Latin script. Write dates and numbers using Western Arabic numerals (0-9).`;

export function buildTailorSystemPrompt(locale: Locale): string {
  const language = localeOutputLanguage[locale];
  const lines = [
    BASE_SYSTEM_PROMPT,
    `Write every field of your output in ${language}, regardless of the language of the source resume or job description. This includes section headings, entry titles, bullets, the summary, and the cover letter.`,
  ];

  if (locale === "ar") lines.push(ARABIC_GUIDANCE);

  return lines.join("\n");
}

export function buildTailorUserPrompt(resumeText: string, jobDescription: string): string {
  return `MASTER RESUME:
"""
${resumeText}
"""

JOB DESCRIPTION:
"""
${jobDescription}
"""

Produce a tailored resume and a cover letter for this job application.`;
}

const RESUME_ENTRY_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Entry title, e.g. 'Backend Engineer — Acme Corp', or a skills sub-category name.",
    },
    subtitle: {
      type: "string",
      description: "Dates and/or location for this entry, e.g. '2020 - 2024 · Remote'. Empty string if not applicable.",
    },
    bullets: {
      type: "array",
      items: { type: "string" },
      description: "Short bullet points for this entry. For a skills entry, each bullet can just be a skill or a short comma-separated group.",
    },
  },
  required: ["title", "subtitle", "bullets"],
  additionalProperties: false,
} as const;

const RESUME_SECTION_SCHEMA = {
  type: "object",
  properties: {
    heading: {
      type: "string",
      description: "Section heading, e.g. 'Experience', 'Skills', 'Education', 'Projects'.",
    },
    entries: {
      type: "array",
      items: RESUME_ENTRY_SCHEMA,
    },
  },
  required: ["heading", "entries"],
  additionalProperties: false,
} as const;

export const TAILOR_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Candidate's full name, taken from the original resume.",
    },
    title: {
      type: "string",
      description: "A resume headline tailored to the target role, e.g. 'Senior Backend Engineer'. Empty string if the original resume has none.",
    },
    contact: {
      type: "string",
      description: "A single line of contact info (email, phone, location, links) if present in the original resume, separated by ' · '. Empty string if none found.",
    },
    summary: {
      type: "string",
      description: "A short 2-3 sentence professional summary tailored to the job. Empty string if the original resume has no summary section and one shouldn't be invented.",
    },
    sections: {
      type: "array",
      description: "Resume sections in the same order as the original resume.",
      items: RESUME_SECTION_SCHEMA,
    },
    coverLetter: {
      type: "string",
      description: "The full cover letter text, ready to send.",
    },
  },
  required: ["name", "title", "contact", "summary", "sections", "coverLetter"],
  additionalProperties: false,
} as const;
