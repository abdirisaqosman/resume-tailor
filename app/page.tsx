"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  Mail,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import type { TailorResult } from "@/lib/llm";
import { formatResumeAsText } from "@/lib/resumeText";
import { ResumeDocument } from "@/lib/ResumeDocument";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const iconButtonClass =
  "inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground";

function Dropzone({ file, onFileSelect }: { file: File | null; onFileSelect: (file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileSelect(dropped);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-background"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={(event: ChangeEvent<HTMLInputElement>) => onFileSelect(event.target.files?.[0] ?? null)}
      />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-5 w-5 shrink-0 text-accent" />
          <div className="text-left">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{Math.max(1, Math.round(file.size / 1024))} KB</p>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="ml-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">Drop your resume here, or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
        </>
      )}
    </div>
  );
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" onClick={handleCopy} title="Copy" className={iconButtonClass}>
      {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function ResultCard({
  icon,
  title,
  content,
  downloadAction,
}: {
  icon: ReactNode;
  title: string;
  content: string;
  downloadAction: ReactNode;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-accent">{icon}</span>
          {title}
        </div>
        <div className="flex items-center gap-1">
          <CopyButton content={content} />
          {downloadAction}
        </div>
      </div>
      <div className="max-h-[32rem] overflow-y-auto whitespace-pre-wrap px-5 py-4 text-sm leading-relaxed">
        {content}
      </div>
    </div>
  );
}

export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResult | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!resumeFile) {
      setError("Upload a resume file first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Paste the job description first.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);

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
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tailor your resume in seconds</h1>
        <p className="mt-3 text-muted-foreground">
          Upload your resume and a job description — get back a resume rewritten to match, plus a cover letter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-medium">Resume</label>
          <Dropzone file={resumeFile} onFileSelect={setResumeFile} />
        </div>

        <div className="mt-6">
          <label htmlFor="jobDescription" className="mb-2 block text-sm font-medium">
            Job description
          </label>
          <textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Paste the full job posting here..."
            rows={8}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-border bg-danger-bg px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Tailoring..." : "Tailor my resume"}
        </button>
      </form>

      {result && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ResultCard
            icon={<FileText className="h-4 w-4" />}
            title="Tailored Resume"
            content={formatResumeAsText(result)}
            downloadAction={
              <PDFDownloadLink
                document={<ResumeDocument resume={result} />}
                fileName="tailored-resume.pdf"
                className={iconButtonClass}
                title="Download PDF"
              >
                {({ loading: pdfLoading }) =>
                  pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />
                }
              </PDFDownloadLink>
            }
          />
          <ResultCard
            icon={<Mail className="h-4 w-4" />}
            title="Cover Letter"
            content={result.coverLetter}
            downloadAction={
              <button
                type="button"
                onClick={() => downloadText("cover-letter.txt", result.coverLetter)}
                title="Download .txt"
                className={iconButtonClass}
              >
                <Download className="h-4 w-4" />
              </button>
            }
          />
        </div>
      )}
    </div>
  );
}
