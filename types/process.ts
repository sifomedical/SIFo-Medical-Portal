// ============================================================
// SIFo Medical Process Portal – Typen
// Einfach zu pflegen: Neue Prozesse = neues Objekt im /data/
// ============================================================

export interface ProcessTool {
  name: string;
  url?: string;
  icon?: string;
}

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  tools?: string[];
  tips?: string[];
  substeps?: ProcessStep[];
}

export type CategoryId =
  | "marketing"
  | "sales"
  | "operations"
  | "hr"
  | "quality"
  | "finance";

export interface Process {
  // IDs and Metadata
  id: string;
  slug: string;
  status: "active" | "draft" | "archived";

  // 1. Purpose & Scope
  title: string;
  subtitle: string;
  category: CategoryId;
  description: string;
  purpose?: string;
  scope?: string;

  // 2. Responsibilities & Definitions
  responsibilities?: string[];
  definitions?: Record<string, string>;

  // 3. Inputs
  inputs?: string[];

  // 4. Process Steps
  steps: ProcessStep[];

  // 5. Risks & Controls
  risksAndControls?: Array<{ risk: string; control: string }>;

  // 6. Outputs
  outputs?: string[];

  // 7. Records
  records?: string[];

  // Goals and Tools
  goals: string[];
  tools: ProcessTool[];

  // Metadata
  owner: string;
  frequency: string;
  tags: string[];

  // 8. Flowchart (Mermaid)
  mermaidDiagram: string;

  // Media
  processVideoUrl?: string;

  // Timestamps
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;

  // Version tracking
  versionNumber?: number;
}

export interface Attachment {
  id: string;
  processId: string;
  fileName: string;
  fileType: "pdf" | "image" | "document" | "video" | "other";
  fileSize: number;
  storagePath: string;
  uploadedBy: string;
  createdAt: string;
}

export interface DraftProcess extends Process {
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  editedAt?: string;
  attachments?: Attachment[];
}

export interface Category {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "marketing",
    title: "Marketing",
    description: "Webinare, Google Ads, LinkedIn, YouTube, Content & Kampagnen",
    icon: "📣",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    id: "sales",
    title: "Sales",
    description: "Lead-Qualifizierung, Angebote, CRM, Onboarding & Abschlüsse",
    icon: "🎯",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    id: "operations",
    title: "Operations",
    description: "Interne Abläufe, Lieferkette, Lager & Logistik",
    icon: "⚙️",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    id: "hr",
    title: "HR & Team",
    description: "Recruiting, Onboarding, Schulungen & Teamentwicklung",
    icon: "👥",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
  },
  {
    id: "quality",
    title: "Qualität & Regulatorik",
    description: "ISO 13485, MDR-Compliance, Audits & Dokumentation",
    icon: "✅",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  {
    id: "finance",
    title: "Finance",
    description: "Budgetplanung, Abrechnung, Reporting & Controlling",
    icon: "💰",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
];
