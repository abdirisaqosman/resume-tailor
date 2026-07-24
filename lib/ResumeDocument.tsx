"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { TailorResult } from "./llm";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10, color: "#111111" },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  title: { fontSize: 11, color: "#444444", marginBottom: 4 },
  contact: { fontSize: 9, color: "#444444", marginBottom: 10 },
  summary: { fontSize: 10, lineHeight: 1.5, marginBottom: 4 },
  section: { marginTop: 12 },
  sectionHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
    marginBottom: 6,
    borderBottom: "1pt solid #4f46e5",
    paddingBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  entry: { marginTop: 8 },
  entryRow: { flexDirection: "row", justifyContent: "space-between" },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  entrySubtitle: { fontSize: 9, color: "#444444" },
  bullet: { flexDirection: "row", marginTop: 3 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.4 },
});

export function ResumeDocument({ resume }: { resume: TailorResult }) {
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
