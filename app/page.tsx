"use client";

import { useState, FormEvent } from "react";

interface TailorResult {
  tailoredResume: string;
  coverLetter: string;
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ResultCard({ title, content, filename }: { title: string; content: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="result-card">
      <div className="result-card-header">
        <h2>{title}</h2>
        <div className="result-actions">
          <button type="button" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" onClick={() => downloadText(filename, content)}>
            Download .txt
          </button>
        </div>
      </div>
      <div className="result-content">{content}</div>
    </div>
  );
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!(formData.get("resume") as File)?.size) {
      setError("Upload a resume file first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Paste the job description first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setResult(data as TailorResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header>
        <h1>Resume Tailor</h1>
        <p>Upload your resume, paste a job description, and get a tailored resume plus a cover letter.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="resume">
            Master resume <span className="field-hint">PDF, DOCX, or TXT</span>
          </label>
          <input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          {fileName && <p className="field-hint">Selected: {fileName}</p>}
        </div>

        <div>
          <label htmlFor="jobDescription">Job description</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job posting here..."
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Tailoring..." : "Tailor my resume"}
        </button>
      </form>

      {result && (
        <div className="results">
          <ResultCard title="Tailored Resume" content={result.tailoredResume} filename="tailored-resume.txt" />
          <ResultCard title="Cover Letter" content={result.coverLetter} filename="cover-letter.txt" />
        </div>
      )}
    </main>
  );
}
