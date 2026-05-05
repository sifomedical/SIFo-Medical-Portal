import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as fs from "fs";
import * as path from "path";
import { Process } from "@/types/process";
import { generateMermaidFlowchart } from "@/lib/mermaid-generator";
import { prepareAndValidateProcess } from "@/lib/process-utils";
import { commitAndPush } from "@/lib/git-operations";
import { ALL_PROCESSES } from "@/data/processes";

/**
 * POST /api/admin/processes/create
 *
 * Admin endpoint to create a new process
 * Validates data → Generates Mermaid → Writes JSON → Git Commit + Push
 */

export async function POST(request: Request) {
  try {
    // 1. Check authentication and authorization
    const session = (await getServerSession()) as any;
    const isDevTest = process.env.NODE_ENV === "development" &&
                      request.headers.get("x-test-bypass") === "true";

    let userEmail: string | null = null;
    let isAdmin = false;

    if (isDevTest) {
      // Development test mode: allow without authentication
      isAdmin = true;
      userEmail = "dev-test@localhost";
    } else if (session?.user?.email) {
      // Normal mode: check admin status
      userEmail = session.user.email;
      isAdmin = userEmail === process.env.ADMIN_EMAIL;
    } else {
      // No authentication and not dev test mode
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - admin only" }, { status: 403 });
    }

    // 3. Parse request body
    const body = await request.json();

    // 4. Generate Mermaid diagram from steps
    const mermaidDiagram = generateMermaidFlowchart(body.steps || []);

    // 5. Validate and prepare process
    const { process: newProcess, errors, warnings } = prepareAndValidateProcess(
      body,
      mermaidDiagram,
      ALL_PROCESSES
    );

    if (!newProcess) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors,
          warnings,
        },
        { status: 400 }
      );
    }

    // 6. Write JSON file to /data/processes/
    const dataDir = path.join(process.cwd(), "data", "processes");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, `${newProcess.slug}.json`);
    const fileContent = JSON.stringify(newProcess, null, 2);
    fs.writeFileSync(filePath, fileContent, "utf-8");

    // 7. Git operations: Add, commit, push
    const commitMessage = `Add process: ${newProcess.title}

- Category: ${newProcess.category}
- Owner: ${newProcess.owner}
- Steps: ${newProcess.steps.length}
- Tools: ${newProcess.tools.length}

Co-Authored-By: Admin <${userEmail}>`;

    const gitResult = commitAndPush(
      `data/processes/${newProcess.slug}.json`,
      commitMessage,
      "main"
    );

    if (!gitResult.success) {
      // File was written but git failed - this is a partial success
      return NextResponse.json(
        {
          success: true,
          message: "Process created locally but git push failed",
          slug: newProcess.slug,
          gitWarning: gitResult.steps[gitResult.steps.length - 1]?.error,
          warnings: [...warnings, "Git push failed - you may need to push manually"],
        },
        { status: 201 }
      );
    }

    // 8. Success - process created and pushed
    return NextResponse.json(
      {
        success: true,
        message: "Process created and committed",
        slug: newProcess.slug,
        id: newProcess.id,
        processUrl: `/${newProcess.category}/${newProcess.slug}`,
        warnings: warnings.length > 0 ? warnings : undefined,
        gitStatus: gitResult.steps.map((s) => ({
          step: s.message,
          success: s.success,
        })),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating process:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error creating process",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
