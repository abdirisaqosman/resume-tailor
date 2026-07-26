"use client";

import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { TailorResult } from "./llm";
import type { Locale } from "@/i18n/config";

const ARABIC_FAMILY = "IBMPlexSansArabic";

/** Arabic, Arabic Supplement, Extended-A, and the presentation-form blocks. */
const ARABIC_PATTERN = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

let arabicFontReady = false;

/**
 * Helvetica (the react-pdf default) has no Arabic glyphs, so Arabic résumés
 * need a registered face. Registration fetches the TTF, so it only runs in the
 * browser and only when there is actually Arabic text to render.
 */
function ensureArabicFont() {
  if (arabicFontReady || typeof window === "undefined") return;

  Font.register({
    family: ARABIC_FAMILY,
    fonts: [
      { src: "/fonts/IBMPlexSansArabic-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/IBMPlexSansArabic-Bold.ttf", fontWeight: 700 },
    ],
  });
  // The default hyphenation engine splits words mid-token, which breaks
  // Arabic letter joining. Keep words intact.
  Font.registerHyphenationCallback((word) => [word]);

  arabicFontReady = true;
}

function collectText(resume: TailorResult): string {
  return [
    resume.name,
    resume.title,
    resume.contact,
    resume.summary,
    ...resume.sections.flatMap((section) => [
      section.heading,
      ...section.entries.flatMap((entry) => [entry.title, entry.subtitle, ...entry.bullets]),
    ]),
  ].join(" ");
}

function createStyles(rtl: boolean, fontFamily: string, boldFamily: string) {
  const align = rtl ? "right" : "left";

  return StyleSheet.create({
    page: {
      padding: 40,
      fontFamily,
      fontSize: 10,
      color: "#111111",
      direction: rtl ? "rtl" : "ltr",
      textAlign: align,
    },
    name: { fontSize: 22, fontFamily: boldFamily, fontWeight: 700, marginBottom: 2 },
    title: { fontSize: 11, color: "#444444", marginBottom: 4 },
    contact: { fontSize: 9, color: "#444444", marginBottom: 10 },
    summary: { fontSize: 10, lineHeight: 1.5, marginBottom: 4 },
    section: { marginTop: 12 },
    sectionHeading: {
      fontSize: 11,
      fontFamily: boldFamily,
      fontWeight: 700,
      color: "#4f46e5",
      marginBottom: 6,
      borderBottom: "1pt solid #4f46e5",
      paddingBottom: 3,
      textTransform: rtl ? "none" : "uppercase",
      letterSpacing: rtl ? 0 : 1,
    },
    entry: { marginTop: 8 },
    entryRow: {
      flexDirection: rtl ? "row-reverse" : "row",
      justifyContent: "space-between",
    },
    entryTitle: { fontFamily: boldFamily, fontWeight: 700, fontSize: 10 },
    entrySubtitle: { fontSize: 9, color: "#444444" },
    bullet: { flexDirection: rtl ? "row-reverse" : "row", marginTop: 3 },
    bulletDot: { width: 10, fontSize: 10, textAlign: align },
    bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4, textAlign: align },
  });
}

export function ResumeDocument({ resume, locale = "en" }: { resume: TailorResult; locale?: Locale }) {
  const hasArabic = ARABIC_PATTERN.test(collectText(resume));
  const rtl = locale === "ar" || hasArabic;

  if (hasArabic || locale === "ar") ensureArabicFont();

  // IBM Plex Sans Arabic covers Latin too, so one family can carry a mixed résumé.
  const useArabicFamily = hasArabic || locale === "ar";
  const styles = createStyles(
    rtl,
    useArabicFamily ? ARABIC_FAMILY : "Helvetica",
    useArabicFamily ? ARABIC_FAMILY : "Helvetica-Bold"
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{resume.name}</Text>
        {resume.title ? <Text style={styles.title}>{resume.title}</Text> : null}
        {resume.contact ? <Text style={styles.contact}>{resume.contact}</Text> : null}
        {resume.summary ? <Text style={styles.summary}>{resume.summary}</Text> : null}

        {resume.sections.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.entries.map((entry, j) => (
              <View key={j} style={styles.entry} wrap={false}>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                  {entry.subtitle ? <Text style={styles.entrySubtitle}>{entry.subtitle}</Text> : null}
                </View>
                {entry.bullets.map((bullet, k) => (
                  <View key={k} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}
