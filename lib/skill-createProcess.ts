/**
 * Skill Helper: /createSIFoprocess
 *
 * This utility provides functions for the /createSIFoprocess skill to use
 * when creating new draft processes from natural language descriptions.
 *
 * The skill orchestrates:
 * 1. Multi-turn conversation to gather process details
 * 2. JSON structure generation
 * 3. Mermaid diagram auto-generation
 * 4. API call to save as draft
 * 5. Admin approval workflow
 */

import { Process, ProcessStep, ProcessTool, CategoryId } from "@/types/process";

/**
 * Generate a unique slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 50);
}

/**
 * Generate a Mermaid flowchart diagram from process steps
 */
export function generateMermaidDiagram(steps: ProcessStep[]): string {
  if (!steps || steps.length === 0) {
    return "graph TD\n  A[Keine Schritte] --> B[Bitte Schritte hinzufügen]";
  }

  let diagram = "graph TD\n";
  let nodeId = 0;

  const addStep = (step: ProcessStep, indent = 0) => {
    const currentId = nodeId++;
    const nodeLabel = step.title
      .substring(0, 30)
      .replace(/"/g, "'");

    diagram += `  ${String.fromCharCode(65 + (currentId % 26))}${Math.floor(currentId / 26) || ""}["${nodeLabel}"]`;

    if (step.substeps && step.substeps.length > 0) {
      diagram += "\n";
      for (const substep of step.substeps) {
        const substepId = nodeId++;
        const substepLabel = substep.title
          .substring(0, 25)
          .replace(/"/g, "'");
        diagram += `  ${String.fromCharCode(65 + (substepId % 26))}${Math.floor(substepId / 26) || ""}["${substepLabel}"]\n`;

        if (currentId > 0) {
          const prevId = currentId - 1;
          diagram += `  ${String.fromCharCode(65 + (prevId % 26))}${Math.floor(prevId / 26) || ""} --> ${String.fromCharCode(65 + (substepId % 26))}${Math.floor(substepId / 26) || ""}\n`;
        }
      }
    } else if (currentId > 0) {
      const prevId = currentId - 1;
      diagram += `\n  ${String.fromCharCode(65 + (prevId % 26))}${Math.floor(prevId / 26) || ""} --> ${String.fromCharCode(65 + (currentId % 26))}${Math.floor(currentId / 26) || ""}\n`;
    } else {
      diagram += "\n";
    }
  };

  steps.forEach(step => addStep(step));

  // Add end node
  const endId = nodeId++;
  diagram += `  ${String.fromCharCode(65 + (endId % 26))}${Math.floor(endId / 26) || ""}["✓ Abgeschlossen"]`;

  if (nodeId > 1) {
    const lastId = nodeId - 2;
    diagram += `\n  ${String.fromCharCode(65 + (lastId % 26))}${Math.floor(lastId / 26) || ""} --> ${String.fromCharCode(65 + (endId % 26))}${Math.floor(endId / 26) || ""}`;
  }

  return diagram;
}

/**
 * Validate process structure before submission
 */
export function validateProcess(process: Partial<Process>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!process.title || process.title.trim().length === 0) {
    errors.push("Titel ist erforderlich");
  }
  if (!process.subtitle || process.subtitle.trim().length === 0) {
    errors.push("Untertitel ist erforderlich");
  }
  if (!process.category) {
    errors.push("Kategorie ist erforderlich");
  }
  if (!process.description || process.description.trim().length === 0) {
    errors.push("Beschreibung ist erforderlich");
  }
  if (!process.goals || process.goals.length === 0) {
    errors.push("Mindestens ein Ziel ist erforderlich");
  }
  if (!process.steps || process.steps.length === 0) {
    errors.push("Mindestens ein Schritt ist erforderlich");
  }
  if (!process.tools || process.tools.length === 0) {
    errors.push("Mindestens ein Tool ist erforderlich");
  }
  if (!process.owner || process.owner.trim().length === 0) {
    errors.push("Owner ist erforderlich");
  }
  if (!process.frequency || process.frequency.trim().length === 0) {
    errors.push("Frequenz ist erforderlich");
  }
  if (!process.tags || process.tags.length === 0) {
    errors.push("Mindestens ein Tag ist erforderlich");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Save draft process via API
 */
export async function saveDraftProcessViaAPI(
  process: Process,
  userEmail: string
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const response = await fetch("/api/processes/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(process),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || "Fehler beim Speichern" };
    }

    return { success: true, slug: data.slug };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
}

/**
 * Format process for display/preview
 */
export function formatProcessPreview(process: Process): string {
  const toolNames = process.tools.map((t) => t.name).join(", ");
  const goalsList = process.goals.map((g) => `• ${g}`).join("\n");
  const stepsList = process.steps
    .map((s) => `• ${s.title}${s.substeps ? ` (${s.substeps.length} Substeps)` : ""}`)
    .join("\n");

  return `
✅ PROZESS VORLAGE GENERIERT

📋 TITEL: ${process.title}
📝 UNTERTITEL: ${process.subtitle}
🏷️ KATEGORIE: ${process.category}
👤 OWNER: ${process.owner}
⏱️ FREQUENZ: ${process.frequency}

📌 BESCHREIBUNG:
${process.description}

🎯 ZIELE:
${goalsList}

📍 SCHRITTE:
${stepsList}

🛠️ TOOLS:
${toolNames}

🏷️ TAGS:
${process.tags.join(", ")}

✨ Der Prozess wurde als Entwurf gespeichert und wartet auf Genehmigung durch den Admin.
📧 Admin wird benachrichtigt: sifo.medical@gmail.com
🔗 Link zur Genehmigung: https://[your-domain]/admin/processes
  `;
}

/**
 * Available categories for the skill to suggest
 */
export const AVAILABLE_CATEGORIES: CategoryId[] = [
  "marketing",
  "sales",
  "operations",
  "hr",
  "quality",
  "finance",
];

/**
 * Example process steps for reference
 */
export const EXAMPLE_STEPS = {
  workflow: [
    {
      id: "step-1",
      title: "Anfrage erhalten",
      description: "Neue Anfrage kommt an",
      tools: [],
    },
    {
      id: "step-2",
      title: "Anfrage verarbeiten",
      description: "Anfrage analysieren und kategorisieren",
      tools: [],
    },
    {
      id: "step-3",
      title: "Antwort erstellen",
      description: "Passende Antwort vorbereiten",
      tools: [],
    },
    {
      id: "step-4",
      title: "Antwort versenden",
      description: "Antwort an Anfragender senden",
      tools: [],
    },
  ],
};
