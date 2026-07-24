import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sparkles } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resume Tailor",
  description: "Tailor your resume and generate a cover letter for any job description.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 border-b border-border/80 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Resume Tailor</p>
              <p className="mt-0.5 text-xs text-muted-foreground">AI-tailored resumes &amp; cover letters</p>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        <footer className="border-t border-border py-6">
          <div className="mx-auto max-w-4xl px-6 text-center text-xs text-muted-foreground">
            Your resume and job description are sent to your configured AI provider to generate results.
          </div>
        </footer>
      </body>
    </html>
  );
}
