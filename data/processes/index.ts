// ============================================================
// Prozess-Datenbank – Zentrales Register
// Neuen Prozess hinzufügen: JSON-Datei in /data/processes/ anlegen.
// Der Loader liest automatisch alle .json-Dateien.
// ============================================================

import { Process, CategoryId } from "@/types/process";
import { loadProcessesFromJSON } from "./loader";

// Prozesse werden zur Build-Zeit aus JSON-Dateien geladen
export const ALL_PROCESSES: Process[] = loadProcessesFromJSON();

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
