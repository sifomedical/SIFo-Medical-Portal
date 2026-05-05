import { ProcessStep } from "@/types/process";

/**
 * Generate Mermaid flowchart from process steps
 * Converts hierarchical steps into a visual flowchart
 */

const COLORS = {
  start: "#1B3A6B", // Navy (SIFo primary)
  end: "#1B3A6B",
  process: "#0C2340", // Darker navy
  decision: "#00A68B", // Teal
  error: "#D81E5B", // Pink/Red
};

/**
 * Convert a title to a valid Mermaid node ID
 * Removes special chars, converts to lowercase, replaces spaces with underscores
 */
function getTitleAsNodeId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 30);
}

/**
 * Escape quotes and special characters for Mermaid syntax
 */
function escapeForMermaid(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/\n/g, " ")
    .substring(0, 50);
}

/**
 * Generate a Mermaid flowchart (TD = Top-Down) from process steps
 * Returns Mermaid syntax string that can be rendered by the MermaidDiagram component
 */
export function generateMermaidFlowchart(steps: ProcessStep[]): string {
  if (!steps || steps.length === 0) {
    return "flowchart TD\n  A[\"Keine Schritte\"]";
  }

  let mermaid = "flowchart TD\n";
  let nodeCount = 0;
  const nodeMap: { [key: string]: string } = {};

  // Helper to generate unique node IDs
  function getNextNodeId(): string {
    const id = String.fromCharCode(65 + (nodeCount % 26)) + Math.floor(nodeCount / 26);
    nodeCount++;
    return id;
  }

  // Start node
  const startNode = getNextNodeId();
  mermaid += `  ${startNode}["🚀 Start: Prozess"]`;
  mermaid += `:::processStart\n`;

  let previousNode = startNode;

  // Process each step
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNode = getNextNodeId();
    const stepTitle = escapeForMermaid(step.title);
    const icon = i === steps.length - 1 ? "✅" : "📋";

    // Main step node
    mermaid += `  ${stepNode}["${icon} ${stepTitle}"]`;
    mermaid += `:::process\n`;

    // Connect to previous
    mermaid += `  ${previousNode} --> ${stepNode}\n`;

    // Store node mapping for substeps
    nodeMap[step.id] = stepNode;

    // Handle substeps if they exist
    if (step.substeps && step.substeps.length > 0) {
      let lastSubstepNode = stepNode;

      for (const substep of step.substeps) {
        const substepNode = getNextNodeId();
        const substepTitle = escapeForMermaid(substep.title);

        mermaid += `  ${substepNode}["  → ${substepTitle}"]`;
        mermaid += `:::substep\n`;
        mermaid += `  ${lastSubstepNode} --> ${substepNode}\n`;

        lastSubstepNode = substepNode;
      }

      previousNode = lastSubstepNode;
    } else {
      previousNode = stepNode;
    }
  }

  // End node
  const endNode = getNextNodeId();
  mermaid += `  ${endNode}["🎉 Abgeschlossen"]`;
  mermaid += `:::processEnd\n`;
  mermaid += `  ${previousNode} --> ${endNode}\n`;

  // Add styling classes
  mermaid += `\n  classDef processStart fill:${COLORS.start},stroke:#000,stroke-width:2px,color:#fff,font-weight:bold\n`;
  mermaid += `  classDef processEnd fill:${COLORS.end},stroke:#000,stroke-width:2px,color:#fff,font-weight:bold\n`;
  mermaid += `  classDef process fill:${COLORS.process},stroke:#333,stroke-width:1.5px,color:#fff\n`;
  mermaid += `  classDef substep fill:#6B7280,stroke:#333,stroke-width:1px,color:#fff,font-size:12px\n`;
  mermaid += `  classDef decision fill:${COLORS.decision},stroke:#333,stroke-width:2px,color:#fff\n`;

  return mermaid;
}

/**
 * Validate that generated Mermaid syntax is valid
 * Does basic checks for common errors
 */
export function validateMermaidSyntax(syntax: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for required keywords
  if (!syntax.includes("flowchart")) {
    errors.push("Missing 'flowchart' keyword");
  }

  // Check for matching quotes
  const singleQuotes = (syntax.match(/"/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    errors.push("Unmatched quotes in Mermaid syntax");
  }

  // Check for at least one connection
  if (!syntax.includes("-->")) {
    errors.push("No connections (-->) found in flowchart");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
