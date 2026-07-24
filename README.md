# Resume Tailor

Upload a master resume (PDF/DOCX/TXT), paste a job description, and get back an AI-tailored resume (downloadable as PDF) plus a matching cover letter.

## Setup

```bash
npm install
cp .env.local.example .env.local
# add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- `app/page.tsx` — upload form + results UI (Tailwind CSS)
- `app/api/tailor/route.ts` — handles the upload, extracts resume text, calls the LLM
- `lib/parseResume.ts` — PDF (`pdf-parse`) / DOCX (`mammoth`) text extraction
- `lib/llm.ts` — provider abstraction; set `LLM_PROVIDER` to `anthropic` (default), `openai`, or `gemini` in `.env.local`
- `lib/prompts.ts` — the tailoring prompt + structured output schema (name, headline, contact, summary, sections)
- `lib/resumeText.ts` — flattens the structured resume into plain text for the on-screen preview / copy button
- `lib/ResumeDocument.tsx` — renders the structured resume as a PDF via `@react-pdf/renderer`

## Provider config

| Env var | Default | Notes |
|---|---|---|
| `LLM_PROVIDER` | `anthropic` | `anthropic`, `openai`, or `gemini` |
| `ANTHROPIC_API_KEY` | — | required for the anthropic provider |
| `OPENAI_API_KEY` | — | required for the openai provider |
| `OPENAI_MODEL` | `gpt-4o` | only used with the openai provider |
| `GEMINI_API_KEY` | — | required for the gemini provider; free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | `gemini-flash-latest` | only used with the gemini provider |
