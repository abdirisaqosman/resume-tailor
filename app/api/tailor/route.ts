import { NextResponse } from "next/server";
import { parseResumeFile } from "@/lib/parseResume";
import { tailorResume } from "@/lib/llm";
import { buildTailorSystemPrompt, buildTailorUserPrompt } from "@/lib/prompts";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export async function POST(request: Request) {
  const formData = await request.formData();
  const localeField = formData.get("locale");
  const locale =
    typeof localeField === "string" && isLocale(localeField) ? localeField : defaultLocale;
  const { errors } = getDictionary(locale);

  try {
    const resumeFile = formData.get("resume");
    const jobDescription = formData.get("jobDescription");

    if (!(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json({ error: errors.uploadResume }, { status: 400 });
    }
    if (typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: errors.pasteJob }, { status: 400 });
    }

    const resumeText = await parseResumeFile(resumeFile);
    if (resumeText.trim().length === 0) {
      return NextResponse.json({ error: errors.emptyResume }, { status: 400 });
    }

    const userPrompt = buildTailorUserPrompt(resumeText, jobDescription);
    const result = await tailorResume(buildTailorSystemPrompt(locale), userPrompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tailor request failed:", error);
    const message = error instanceof Error ? error.message : errors.generic;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
