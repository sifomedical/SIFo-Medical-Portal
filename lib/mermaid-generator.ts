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
 *
 * Enhanced version that:
 * - Creates more visual and readable flowcharts
 * - Supports decision points and alternatives
 * - Better formatting with step numbering
 * - Uses icons to distinguish step types
 */
export function generateMermaidFlowchart(steps: ProcessStep[]): string {
  if (!steps || steps.length === 0) {
    return "flowchart TD\n  A[\"Keine Schritte\"]";
  }

  let mermaid = "flowchart TD\n";
  let nodeCount = 0;

  // Helper to generate unique node IDs
  function getNextNodeId(): string {
    const id = String.fromCharCode(65 + (nodeCount % 26)) + Math.floor(nodeCount / 26);
    nodeCount++;
    return id;
  }

  // Start node with better styling
  const startNode = getNextNodeId();
  mermaid += `    ${startNode}([🎯 ${escapeForMermaid("Prozess starten")}])\n`;
  mermaid += `    style ${startNode} fill:#1B3A6B,stroke:#000,stroke-width:2px,color:#fff,font-weight:bold\n`;

  let previousNode = startNode;
  let stepCounter = 1;

  // Process each step with improved formatting
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepNode = getNextNodeId();

    // Format step title with numbering
    const stepNumber = `${stepCounter}.`;
    const stepTitle = escapeForMermaid(step.title || `Schritt ${stepCounter}`);
    const displayTitle = `${stepNumber} ${stepTitle}`;

    // Main step node with appropriate icon based on position
    const icon = i === steps.length - 1 ? "✅" : "📋";
    mermaid += `    ${stepNode}["${icon} ${displayTitle}"]\n`;
    mermaid += `    style ${stepNode} fill:#0C2340,stroke:#333,stroke-width:1.5px,color:#fff\n`;

    // Connect to previous
    mermaid += `    ${previousNode} --> ${stepNode}\n`;

    // Handle substeps if they exist - create a branching path
    if (step.substeps && step.substeps.length > 0) {
      let substepNodes: string[] = [];

      for (let j = 0; j < step.substeps.length; j++) {
        const substep = step.substeps[j];
        const substepNode = getNextNodeId();
        const substepNum = String.fromCharCode(97 + j); // a, b, c, etc.
        const substepTitle = escapeForMermaid(substep.title || `Teilschritt ${substepNum}`);

        mermaid += `    ${substepNode}["→ ${substepTitle}"]\n`;
        mermaid += `    style ${substepNode} fill:#6B7280,stroke:#555,stroke-width:1px,color:#fff,font-size:12px\n`;

        // Branch from main step
        if (j === 0) {
          mermaid += `    ${stepNode} --> ${substepNode}\n`;
        } else {
          mermaid += `    ${stepNode} -.-> ${substepNode}\n`;
        }

        substepNodes.push(substepNode);
      }

      // Reconnect all substeps to continue the flow
      if (substepNodes.length > 0) {
        // Use the last substep as the connection point
        previousNode = substepNodes[substepNodes.length - 1];
      } else {
        previousNode = stepNode;
      }
    } else {
      previousNode = stepNode;
    }

    stepCounter++;
  }

  // End node with completion icon
  const endNode = getNextNodeId();
  mermaid += `    ${endNode}([🎉 ${escapeForMermaid("Prozess abgeschlossen")}])\n`;
  mermaid += `    style ${endNode} fill:#1B3A6B,stroke:#000,stroke-width:2px,color:#fff,font-weight:bold\n`;
  mermaid += `    ${previousNode} --> ${endNode}\n`;

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
