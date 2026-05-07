import { kv } from "@vercel/kv";
import { Process, DraftProcess } from "@/types/process";
import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Saves a draft process to Vercel KV (deprecated - now using Supabase)
 */
export async function saveDraftProcess(
  process: Process,
  createdBy: string
): Promise<void> {
  // Note: This is deprecated. Drafts are now saved via /api/processes/draft/route.ts to Supabase
  console.log(`ℹ️ saveDraftProcess is deprecated. Use /api/processes/draft endpoint instead.`);
}

/**
 * Get a single draft or archived process by slug from Supabase
 */
export async function getDraftProcess(
  slug: string
): Promise<DraftProcess | null> {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .eq('slug', slug)
      .in('status', ['draft', 'archived'])
      .single();

    if (error || !data) {
      console.warn(`⚠️ Draft process not found: ${slug}`);
      return null;
    }

    // Map Supabase row to DraftProcess type
    const draftProcess: DraftProcess = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      purpose: data.purpose,
      scope: data.scope,
      category: data.category,
      responsibilities: data.responsibilities || [],
      definitions: data.definitions || {},
      inputs: data.inputs || [],
      steps: data.steps || [],
      risksAndControls: data.risks_and_controls || [],
      outputs: data.outputs || [],
      records: data.records || [],
      tools: data.tools || [],
      goals: data.goals || [],
      tags: data.tags || [],
      owner: data.owner,
      frequency: data.frequency,
      processVideoUrl: data.process_video_url,
      mermaidDiagram: data.mermaid_diagram || '',
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      approvedBy: data.approved_by,
      approvedAt: data.approved_at,
      editedAt: data.updated_at,
      lastUpdated: data.updated_at || data.created_at,
    };

    return draftProcess;
  } catch (error) {
    console.error(`❌ Error fetching draft process ${slug}:`, error);
    return null;
  }
}

/**
 * Get all draft and archived processes (admin only) from Supabase
 */
export async function getAllDraftProcesses(): Promise<DraftProcess[]> {
  try {
    // Fetch both draft and archived processes
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .in('status', ['draft', 'archived'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching draft/archived processes from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No draft or archived processes found');
      return [];
    }

    // Map Supabase rows to DraftProcess type
    const processes: DraftProcess[] = data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      purpose: row.purpose,
      scope: row.scope,
      category: row.category,
      responsibilities: row.responsibilities || [],
      definitions: row.definitions || {},
      inputs: row.inputs || [],
      steps: row.steps || [],
      risksAndControls: row.risks_and_controls || [],
      outputs: row.outputs || [],
      records: row.records || [],
      tools: row.tools || [],
      goals: row.goals || [],
      tags: row.tags || [],
      owner: row.owner,
      frequency: row.frequency,
      processVideoUrl: row.process_video_url,
      mermaidDiagram: row.mermaid_diagram || '',
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      editedAt: row.updated_at,
      lastUpdated: row.updated_at || row.created_at,
    }));

    console.log(`✅ Found ${processes.length} draft processes in Supabase`);
    return processes;
  } catch (error) {
    console.error('❌ Exception fetching draft processes:', error);
    return [];
  }
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

  const now = new Date().toISOString();
  const approvedProcess: Process = {
    ...draftProcess,
    status: "active",
    lastUpdated: now,
  };

  try {
    console.log(`🔄 Attempting to update Supabase for slug: ${slug}`);
    console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ set' : '❌ not set'}`);
    console.log(`   Service Role Key: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ set' : '❌ not set'}`);

    // Update in Supabase - mark as active
    const { data, error: updateError } = await supabase
      .from('processes')
      .update({
        status: 'active',
        approved_by: approvedBy,
        approved_at: now,
        updated_at: now,
      })
      .eq('slug', slug)
      .select();

    console.log(`📊 Supabase update response:`, { data, error: updateError });

    if (updateError) {
      console.error('❌ Error updating process in Supabase:', updateError);
    } else {
      console.log(`✅ Process marked as active in Supabase: ${slug}`);
    }
  } catch (error) {
    console.error('❌ Exception updating Supabase:', error);
  }

  // Write to /data/processes/{slug}.json (for local development)
  try {
    const dataDir = path.join(process.cwd(), "data", "processes");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(approvedProcess, null, 2));
    console.log(`📝 Process written to file: ${filePath}`);
  } catch (error) {
    console.error(`⚠️ Could not write to file (might be on Vercel):`, error);
  }

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
