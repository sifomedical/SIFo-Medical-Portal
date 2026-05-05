import { execSync } from "child_process";
import path from "path";

/**
 * Execute git commands and handle errors
 * Used for process creation workflow: commit + push
 */

export interface GitOperationResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Add file to git staging area
 */
export function gitAdd(filePath: string): GitOperationResult {
  try {
    const absolutePath = path.resolve(filePath);
    execSync(`git add "${absolutePath}"`, {
      cwd: process.cwd(),
      stdio: "pipe",
    });
    return {
      success: true,
      message: `Added ${path.basename(filePath)} to git`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Git add failed",
      error: error.message,
    };
  }
}

/**
 * Commit changes with message
 */
export function gitCommit(message: string): GitOperationResult {
  try {
    // Escape quotes in message for shell safety
    const safeMessage = message.replace(/"/g, '\\"');
    execSync(`git commit -m "${safeMessage}"`, {
      cwd: process.cwd(),
      stdio: "pipe",
    });
    return {
      success: true,
      message: `Committed: ${message}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Git commit failed",
      error: error.message,
    };
  }
}

/**
 * Push to remote repository
 */
export function gitPush(branch: string = "main"): GitOperationResult {
  try {
    execSync(`git push origin ${branch}`, {
      cwd: process.cwd(),
      stdio: "pipe",
    });
    return {
      success: true,
      message: `Pushed to ${branch}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Git push failed",
      error: error.message,
    };
  }
}

/**
 * Add, commit, and push a file in one operation
 * Returns detailed result of each step
 */
export function commitAndPush(
  filePath: string,
  commitMessage: string,
  branch: string = "main"
): {
  success: boolean;
  steps: GitOperationResult[];
} {
  const steps: GitOperationResult[] = [];

  // Step 1: Add file
  const addResult = gitAdd(filePath);
  steps.push(addResult);
  if (!addResult.success) {
    return { success: false, steps };
  }

  // Step 2: Commit
  const commitResult = gitCommit(commitMessage);
  steps.push(commitResult);
  if (!commitResult.success) {
    return { success: false, steps };
  }

  // Step 3: Push
  const pushResult = gitPush(branch);
  steps.push(pushResult);

  return {
    success: pushResult.success,
    steps,
  };
}

/**
 * Check if we're in a git repository
 */
export function isGitRepository(): boolean {
  try {
    execSync("git rev-parse --git-dir", {
      cwd: process.cwd(),
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current git branch
 */
export function getCurrentBranch(): string {
  try {
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: process.cwd(),
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();
    return branch;
  } catch {
    return "unknown";
  }
}

/**
 * Check if there are uncommitted changes
 */
export function hasUncommittedChanges(): boolean {
  try {
    const status = execSync("git status --porcelain", {
      cwd: process.cwd(),
      stdio: "pipe",
      encoding: "utf-8",
    }).trim();
    return status.length > 0;
  } catch {
    return false;
  }
}
