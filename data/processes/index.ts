// ============================================================
// Prozess-Datenbank – Zentrales Register
// Neuen Prozess hinzufügen: Datei in /data/processes/ anlegen
// und hier importieren + in die Liste eintragen.
// ============================================================

import { Process, CategoryId } from "@/types/process";

// Imports – hier neue Prozesse hinzufügen:
import webinare from "./marketing-webinare";
import googleAds from "./marketing-google-ads";
import linkedin from "./marketing-linkedin";
import leadQualifizierung from "./sales-lead-qualifizierung";

// Vollständige Prozess-Liste:
export const ALL_PROCESSES: Process[] = [
  webinare,
  googleAds,
  linkedin,
  leadQualifizierung,
];

// Hilfsfunktionen:
export function getProcessesByCategory(category: CategoryId): Process[] {
  return ALL_PROCESSES.filter(
    (p) => p.category === category && p.status === "active"
  );
}

export function getProcessBySlug(
  category: CategoryId,
  slug: string
): Process | undefined {
  return ALL_PROCESSES.find(
    (p) => p.category === category && p.slug === slug
  );
}

export function getAllSlugs(): { category: string; slug: string }[] {
  return ALL_PROCESSES.map((p) => ({ category: p.category, slug: p.slug }));
}
