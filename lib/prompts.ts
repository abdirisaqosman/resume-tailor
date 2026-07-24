export const TAILOR_SYSTEM_PROMPT = `You are an expert resume writer and career coach. Given a candidate's master resume and a target job description, you:
1. Rewrite the resume content to emphasize the experience, skills, and achievements most relevant to the job description, without fabricating anything not present in the original resume.
2. Write a concise, tailored cover letter (3-4 paragraphs) connecting the candidate's background to the specific role and company context found in the job description.
Keep the tailored resume in the same overall structure and section order as the original, but reworded and reprioritized for relevance. Preserve factual details (dates, employers, titles, metrics) exactly as given.`;

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

export const TAILOR_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    tailoredResume: {
      type: "string",
      description: "The full tailored resume text, formatted with clear section headings and line breaks.",
    },
    coverLetter: {
      type: "string",
      description: "The full cover letter text, ready to send.",
    },
  },
  required: ["tailoredResume", "coverLetter"],
  additionalProperties: false,
} as const;
