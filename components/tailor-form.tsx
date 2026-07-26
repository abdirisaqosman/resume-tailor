"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TailorResult } from "@/lib/llm";
import { formatResumeAsText } from "@/lib/resumeText";
import { ResumeDocument } from "@/lib/ResumeDocument";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function IconAction({ label, children, ...props }: ComponentProps<typeof Button> & { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function Dropzone({
  file,
  onFileSelect,
  dict,
}: {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  dict: Dictionary;
}) {
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
      role="button"
      tabIndex={0}
      aria-labelledby="resume-label"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      )}
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
          <FileText className="size-5 shrink-0 text-primary" />
          <div className="min-w-0 text-start">
            <p className="truncate text-sm font-medium" dir="auto">
              {file.name}
            </p>
            {/* A file size is a measurement — keep it LTR even in an RTL layout. */}
            <p className="text-xs text-muted-foreground" dir="ltr">
              {Math.max(1, Math.round(file.size / 1024))} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ms-1 shrink-0 rounded-full"
            aria-label={dict.form.removeFile}
            onClick={(event) => {
              event.stopPropagation();
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X />
          </Button>
        </div>
      ) : (
        <>
          <UploadCloud className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">
            {dragActive ? dict.form.dropzoneActive : dict.form.dropzoneIdle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{dict.form.resumeHint}</p>
        </>
      )}
    </div>
  );
}

function CopyButton({ content, dict }: { content: string; dict: Dictionary }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <IconAction label={copied ? dict.results.copied : dict.results.copy} onClick={handleCopy}>
      {copied ? <Check className="text-primary" /> : <Copy />}
    </IconAction>
  );
}

function ResultCard({
  icon,
  title,
  content,
  actions,
}: {
  icon: ReactNode;
  title: string;
  content: string;
  actions: ReactNode;
}) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-(--card-spacing)">
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          {title}
        </CardTitle>
        <CardAction className="flex items-center gap-0.5">{actions}</CardAction>
      </CardHeader>
      <Separator />
      <CardContent className="max-h-[32rem] overflow-y-auto pt-(--card-spacing)">
        <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="auto">
          {content}
        </p>
      </CardContent>
    </Card>
  );
}

function ResultSkeleton({ dict }: { dict: Dictionary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          {dict.loading.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="mb-4 text-sm text-muted-foreground">{dict.loading.description}</p>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className={cn("h-3.5", i % 3 === 2 ? "w-2/3" : "w-full")} />
        ))}
      </CardContent>
    </Card>
  );
}

export function TailorForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
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
      setError(dict.errors.noResume);
      return;
    }
    if (!jobDescription.trim()) {
      setError(dict.errors.noJob);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription);
      formData.append("locale", locale);

      const response = await fetch("/api/tailor", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || dict.errors.generic);
      }
      setResult(data as TailorResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errors.generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-xl text-center">
        <Badge variant="secondary" className="mb-4">
          <Sparkles />
          {dict.hero.badge}
        </Badge>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {dict.hero.heading}
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">{dict.hero.subheading}</p>
      </div>

      <Card className="mt-10 [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]">
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div>
              <Label id="resume-label" className="mb-2">
                {dict.form.resumeLabel}
              </Label>
              <Dropzone file={resumeFile} onFileSelect={setResumeFile} dict={dict} />
            </div>

            <div className="mt-6">
              <Label htmlFor="jobDescription" className="mb-2">
                {dict.form.jobLabel}
              </Label>
              <Textarea
                id="jobDescription"
                dir="auto"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder={dict.form.jobPlaceholder}
                rows={8}
                className="min-h-44 leading-relaxed"
              />
              <p className="mt-2 text-xs text-muted-foreground">{dict.form.jobHint}</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle />
                <AlertTitle>{dict.errors.title}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {loading ? dict.form.submitting : dict.form.submit}
              </Button>
              <p className="text-xs text-muted-foreground">{dict.form.outputNote}</p>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <div className="mt-10">
          <ResultSkeleton dict={dict} />
        </div>
      )}

      {result && !loading && (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ResultCard
            icon={<FileText className="size-4" />}
            title={dict.results.resumeTitle}
            content={formatResumeAsText(result)}
            actions={
              <>
                <CopyButton content={formatResumeAsText(result)} dict={dict} />
                <PDFDownloadLink
                  document={<ResumeDocument resume={result} locale={locale} />}
                  fileName={dict.results.resumeFileName}
                  className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                  aria-label={dict.results.downloadPdf}
                  title={dict.results.downloadPdf}
                >
                  {({ loading: pdfLoading }) =>
                    pdfLoading ? <Loader2 className="animate-spin" /> : <Download />
                  }
                </PDFDownloadLink>
              </>
            }
          />
          <ResultCard
            icon={<Mail className="size-4" />}
            title={dict.results.coverLetterTitle}
            content={result.coverLetter}
            actions={
              <>
                <CopyButton content={result.coverLetter} dict={dict} />
                <IconAction
                  label={dict.results.downloadTxt}
                  onClick={() => downloadText(dict.results.coverLetterFileName, result.coverLetter)}
                >
                  <Download />
                </IconAction>
              </>
            }
          />
        </div>
      )}
    </div>
  );
}
