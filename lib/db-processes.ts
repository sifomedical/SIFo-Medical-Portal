import { kv } from "@vercel/kv";
import { Process, DraftProcess } from "@/types/process";
import * as fs from "fs";
import * as path from "path";

/**
 * Saves a draft process to Vercel KV
 * Stores both the process and adds the slug to the drafts set
 */
export async function saveDraftProcess(
  process: Process,
  createdBy: string
): Promise<void> {
  const now = new Date().toISOString();

  const draftProcess: DraftProcess = {
    ...process,
    createdBy,
    createdAt: now,
    approvedBy: undefined,
    approvedAt: undefined,
    editedAt: now,
  };

  // Store the draft process
  const key = `process:draft:${process.slug}`;
  await kv.set(key, JSON.stringify(draftProcess));

  // Add slug to the drafts set
  await kv.sadd("processes:drafts", process.slug);

  console.log(`✅ Draft process saved: ${process.slug}`);
}

/**
 * Get a single draft process by slug
 */
export async function getDraftProcess(
  slug: string
): Promise<DraftProcess | null> {
  const key = `process:draft:${slug}`;
  const data = await kv.get(key);

  if (!data) return null;

  // Handle both string and object responses from KV
  if (typeof data === 'string') {
    return JSON.parse(data) as DraftProcess;
  }

  return data as DraftProcess;
}

/**
 * Get all draft processes (admin only)
 */
export async function getAllDraftProcesses(): Promise<DraftProcess[]> {
  const drafts = await kv.smembers("processes:drafts");

  if (!drafts || drafts.length === 0) return [];

  const processes: DraftProcess[] = [];

  for (const slug of drafts) {
    const process = await getDraftProcess(slug as string);
    if (process) {
      processes.push(process);
    }
  }

  // Sort by creation date (newest first)
  return processes.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get draft processes created by a specific user
 */
export async function getUserDraftProcesses(
  userEmail: string
): Promise<DraftProcess[]> {
  const allDrafts = await getAllDraftProcesses();
  return allDrafts.filter(
    (p) => p.createdBy.toLowerCase() === userEmail.toLowerCase()
  );
}

/**
 * Update a draft process (by creator or admin)
 */
export async function updateDraftProcess(
  slug: string,
  updates: Partial<Process>,
  editedBy: string
): Promise<DraftProcess | null> {
  const currentProcess = await getDraftProcess(slug);
  if (!currentProcess) return null;

  const updatedProcess: DraftProcess = {
    ...currentProcess,
    ...updates,
    slug: currentProcess.slug, // Don't allow slug changes
    editedAt: new Date().toISOString(),
  };

  const key = `process:draft:${slug}`;
  await kv.set(key, JSON.stringify(updatedProcess));

  console.log(`✅ Draft process updated: ${slug} (by ${editedBy})`);
  return updatedProcess;
}

/**
 * Approve a draft process - moves it from draft to active
 * Writes the process to /data/processes/{slug}.json and KV
 */
export async function approveDraftProcess(
  slug: string,
  approvedBy: string
): Promise<DraftProcess | null> {
  const draftProcess = await getDraftProcess(slug);
  if (!draftProcess) return null;

  const approvedProcess: Process = {
    ...draftProcess,
    status: "active",
    lastUpdated: new Date().toISOString(),
  };

  // Store as active process in KV
  const activeKey = `process:active:${slug}`;
  await kv.set(activeKey, JSON.stringify(approvedProcess));

  // Write to /data/processes/{slug}.json
  try {
    const dataDir = path.join(process.cwd(), "data", "processes");

    // Ensure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(approvedProcess, null, 2));
    console.log(`📝 Process written to file: ${filePath}`);
  } catch (error) {
    console.error(`⚠️ Could not write to file (might be on Vercel):`, error);
    // This is expected on Vercel - we still have it in KV
  }

  // Remove from drafts
  await kv.del(`process:draft:${slug}`);
  await kv.srem("processes:drafts", slug);

  console.log(`✅ Draft process approved: ${slug} (by ${approvedBy})`);
  return approvedProcess as DraftProcess;
}

/**
 * Reject a draft process - delete it entirely
 */
export async function rejectDraftProcess(slug: string): Promise<boolean> {
  const draftProcess = await getDraftProcess(slug);
  if (!draftProcess) return false;

  await kv.del(`process:draft:${slug}`);
  await kv.srem("processes:drafts", slug);

  console.log(`✅ Draft process rejected: ${slug}`);
  return true;
}

/**
 * Check if a user can edit a draft process
 * Only creator or admin can edit
 */
export async function canEditDraftProcess(
  slug: string,
  userEmail: string,
  isAdmin: boolean
): Promise<boolean> {
  if (isAdmin) return true;

  const draftProcess = await getDraftProcess(slug);
  if (!draftProcess) return false;

  return draftProcess.createdBy.toLowerCase() === userEmail.toLowerCase();
}

/**
 * Get count of pending drafts (for admin dashboard)
 */
export async function getPendingDraftCount(): Promise<number> {
  const drafts = await kv.smembers("processes:drafts");
  return drafts ? (drafts as string[]).length : 0;
}
