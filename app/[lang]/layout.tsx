import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Sparkles } from "lucide-react";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDirection, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { themeInitScript } from "@/lib/theme";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDictionary(isLocale(lang) ? lang : "en");

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);
  const dir = getDirection(lang);

  return (
    <html
      lang={lang}
      dir={dir}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <DirectionProvider dir={dir}>
          <TooltipProvider>
            <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
              <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-4" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm leading-none font-semibold">{dict.brand.name}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{dict.brand.tagline}</p>
                </div>
                <div className="ms-auto flex items-center gap-1">
                  <LanguageSwitcher locale={lang} dict={dict} />
                  <ThemeToggle dict={dict} />
                </div>
              </div>
            </header>

            <main className="w-full flex-1">{children}</main>

            <footer className="border-t py-6">
              <div className="mx-auto max-w-4xl px-6 text-center text-xs text-muted-foreground">
                {dict.footer.disclaimer}
              </div>
            </footer>
          </TooltipProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
