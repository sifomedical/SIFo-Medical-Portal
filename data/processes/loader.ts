import fs from "fs";
import path from "path";
import { Process } from "@/types/process";

const VALID_CATEGORIES = ["marketing", "sales", "operations", "hr", "quality", "finance"];
const VALID_STATUSES = ["active", "draft", "archived"];

function validateProcess(data: any, filename: string): Process {
  const errors: string[] = [];

  // Check required fields
  if (!data.id || typeof data.id !== "string") {
    errors.push("Missing or invalid 'id' field");
  }
  if (!data.slug || typeof data.slug !== "string") {
    errors.push("Missing or invalid 'slug' field");
  }
  if (!data.title || typeof data.title !== "string") {
    errors.push("Missing or invalid 'title' field");
  }
  if (!data.subtitle || typeof data.subtitle !== "string") {
    errors.push("Missing or invalid 'subtitle' field");
  }
  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    errors.push(
      `Invalid 'category' field. Must be one of: ${VALID_CATEGORIES.join(", ")}`
    );
  }
  if (!data.description || typeof data.description !== "string") {
    errors.push("Missing or invalid 'description' field");
  }
  if (!Array.isArray(data.goals)) {
    errors.push("'goals' must be an array");
  }
  if (!Array.isArray(data.steps)) {
    errors.push("'steps' must be an array");
  }
  if (!Array.isArray(data.tools)) {
    errors.push("'tools' must be an array");
  }
  if (!data.owner || typeof data.owner !== "string") {
    errors.push("Missing or invalid 'owner' field");
  }
  if (!data.frequency || typeof data.frequency !== "string") {
    errors.push("Missing or invalid 'frequency' field");
  }
  if (!data.lastUpdated || typeof data.lastUpdated !== "string") {
    errors.push("Missing or invalid 'lastUpdated' field");
  }
  if (!Array.isArray(data.tags)) {
    errors.push("'tags' must be an array");
  }
  if (!data.status || !VALID_STATUSES.includes(data.status)) {
    errors.push(`Invalid 'status' field. Must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (!data.mermaidDiagram || typeof data.mermaidDiagram !== "string") {
    errors.push("Missing or invalid 'mermaidDiagram' field");
  }

  if (errors.length > 0) {
    throw new Error(
      `Validation failed for ${filename}:\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  return data as Process;
}

export function loadProcessesFromJSON(): Process[] {
  const processes: Process[] = [];

  try {
    // Try multiple possible paths for robustness
    const possibleDirs = [
      path.join(process.cwd(), "data", "processes"),
      path.join(__dirname),
      path.join(process.cwd(), "src", "data", "processes"),
    ];

    let processDir: string | null = null;
    for (const dir of possibleDirs) {
      if (fs.existsSync(dir)) {
        processDir = dir;
        break;
      }
    }

    if (!processDir) {
      throw new Error(
        `Could not find processes directory. Tried: ${possibleDirs.join(", ")}`
      );
    }

    const files = fs.readdirSync(processDir);
    const jsonFiles = files
      .filter((file) => file.endsWith(".json"))
      .sort();

    if (jsonFiles.length === 0) {
      throw new Error(`No JSON process files found in ${processDir}`);
    }

    for (const file of jsonFiles) {
      const filePath = path.join(processDir, file);
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);
        const process = validateProcess(data, file);
        processes.push(process);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(`JSON parse error in ${file}: ${error.message}`);
        }
        throw error;
      }
    }

    // Sort by id for consistent ordering
    processes.sort((a, b) => a.id.localeCompare(b.id));

    console.log(
      `✓ Loaded ${processes.length} process(es) from JSON: ${processes.map((p) => p.id).join(", ")}`
    );
    return processes;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error loading processes:", error.message);
    }
    throw error;
  }
}
