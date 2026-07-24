import { NextResponse } from "next/server";
import { parseResumeFile } from "@/lib/parseResume";
import { tailorResume } from "@/lib/llm";
import { TAILOR_SYSTEM_PROMPT, buildTailorUserPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume");
    const jobDescription = formData.get("jobDescription");

    if (!(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json({ error: "Upload a resume file (PDF, DOCX, or TXT)." }, { status: 400 });
    }
    if (typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      return NextResponse.json({ error: "Paste the job description." }, { status: 400 });
    }

    const resumeText = await parseResumeFile(resumeFile);
    if (resumeText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract any text from the resume file." }, { status: 400 });
    }

    const userPrompt = buildTailorUserPrompt(resumeText, jobDescription);
    const result = await tailorResume(TAILOR_SYSTEM_PROMPT, userPrompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tailor request failed:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
