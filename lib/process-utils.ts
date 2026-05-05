import { Process, ProcessStep } from "@/types/process";

const VALID_CATEGORIES = ["marketing", "sales", "operations", "hr", "quality", "finance"];

/**
 * Validation utilities for process creation
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Comprehensive validation of process data
 * Checks all required fields and constraints
 */
export function validateProcessData(data: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required string fields
  const requiredStringFields = ["title", "subtitle", "description", "owner", "frequency"];
  for (const field of requiredStringFields) {
    if (!data[field] || typeof data[field] !== "string" || data[field].trim() === "") {
      errors.push(`"${field}" is required and must be a non-empty string`);
    }
  }

  // Check category
  if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
    errors.push(`"category" must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  // Check arrays
  if (!Array.isArray(data.goals) || data.goals.length < 2) {
    errors.push('"goals" must be an array with at least 2 items');
  } else {
    data.goals.forEach((goal: any, i: number) => {
      if (typeof goal !== "string" || goal.trim() === "") {
        errors.push(`goal[${i}] must be a non-empty string`);
      }
    });
  }

  if (!Array.isArray(data.steps) || data.steps.length < 2) {
    errors.push('"steps" must be an array with at least 2 items');
  } else {
    data.steps.forEach((step: any, i: number) => {
      if (!step.id || typeof step.id !== "string") {
        errors.push(`step[${i}].id is required`);
      }
      if (!step.title || typeof step.title !== "string") {
        errors.push(`step[${i}].title is required`);
      }
      if (!step.description || typeof step.description !== "string") {
        errors.push(`step[${i}].description is required`);
      }
    });
  }

  if (!Array.isArray(data.tools) || data.tools.length < 1) {
    errors.push('"tools" must be an array with at least 1 item');
  } else {
    data.tools.forEach((tool: any, i: number) => {
      if (!tool.name || typeof tool.name !== "string") {
        errors.push(`tool[${i}].name is required`);
      }
    });
  }

  if (!Array.isArray(data.tags) || data.tags.length < 2) {
    errors.push('"tags" must be an array with at least 2 items');
  }

  // Check optional but should exist
  if (!data.mermaidDiagram || typeof data.mermaidDiagram !== "string") {
    warnings.push("Mermaid diagram is recommended but will be auto-generated if missing");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate a slug from a title
 * Returns kebab-case string suitable for file names and URLs
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Check if a slug already exists in the list of processes
 * and generate a unique variant if needed
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingProcesses: Process[]
): string {
  const existingSlugs = new Set(existingProcesses.map((p) => p.slug));

  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Find a unique variant by appending numbers
  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
}

/**
 * Prepare a complete Process object for storage
 * Adds metadata and timestamps
 */
export function prepareProcess(
  data: any,
  mermaidDiagram: string,
  createdBy?: string
): Process {
  const slug = ensureUniqueSlug(generateSlug(data.title), []);
  const now = new Date().toISOString();

  return {
    id: `process-${slug}`,
    slug,
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    description: data.description.trim(),
    category: data.category,
    goals: Array.isArray(data.goals) ? data.goals.filter((g: any) => g && g.trim()) : [],
    owner: data.owner.trim(),
    frequency: data.frequency.trim(),
    steps: data.steps || [],
    tools: data.tools || [],
    tags: Array.isArray(data.tags) ? data.tags.filter((t: any) => t && t.trim()) : [],
    mermaidDiagram,
    status: "active" as const,
    lastUpdated: now,
    processVideoUrl: data.processVideoUrl ? data.processVideoUrl.trim() : undefined,
  };
}

/**
 * Validate and prepare form data for saving
 * Returns the prepared process or null with errors
 */
export function prepareAndValidateProcess(
  formData: any,
  mermaidDiagram: string,
  existingProcesses: Process[]
): { process: Process | null; errors: string[]; warnings: string[] } {
  // Validate form data
  const validation = validateProcessData(formData);
  if (!validation.valid) {
    return {
      process: null,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  // Prepare process object
  const baseSlug = generateSlug(formData.title);
  const uniqueSlug = ensureUniqueSlug(baseSlug, existingProcesses);

  // Check if slug was modified (duplicate detected)
  if (uniqueSlug !== baseSlug) {
    validation.warnings.push(`Slug "${baseSlug}" already exists. Using "${uniqueSlug}" instead.`);
  }

  // Create process with unique slug
  const process: Process = {
    id: `process-${uniqueSlug}`,
    slug: uniqueSlug,
    title: formData.title.trim(),
    subtitle: formData.subtitle.trim(),
    description: formData.description.trim(),
    category: formData.category,
    goals: formData.goals.filter((g: any) => g && g.trim()),
    owner: formData.owner.trim(),
    frequency: formData.frequency.trim(),
    steps: formData.steps || [],
    tools: formData.tools || [],
    tags: formData.tags.filter((t: any) => t && t.trim()),
    mermaidDiagram,
    status: "active" as const,
    lastUpdated: new Date().toISOString(),
    processVideoUrl: formData.processVideoUrl ? formData.processVideoUrl.trim() : undefined,
  };

  return {
    process,
    errors: [],
    warnings: validation.warnings,
  };
}
