import type { TailorResult } from "./llm";

export function formatResumeAsText(resume: TailorResult): string {
  const lines: string[] = [resume.name];
  if (resume.title) lines.push(resume.title);
  if (resume.contact) lines.push(resume.contact);
  lines.push("");

  if (resume.summary) {
    lines.push(resume.summary, "");
  }

  for (const section of resume.sections) {
    lines.push(section.heading.toUpperCase());
    for (const entry of section.entries) {
      lines.push(entry.subtitle ? `${entry.title} — ${entry.subtitle}` : entry.title);
      for (const bullet of entry.bullets) {
        lines.push(`- ${bullet}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
