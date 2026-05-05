import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import {
  getDraftProcess,
  approveDraftProcess,
} from "@/lib/db-processes";
import { triggerVercelDeploy } from "@/lib/vercel-deploy";

/**
 * POST /api/admin/processes/approve
 * Approve a draft process and make it active
 * Also saves it to /data/processes/ for next build
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin status
    const session = (await getServerSession()) as any;
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isAdmin =
      session.user.email === process.env.ADMIN_EMAIL ||
      session.user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - admin only" },
        { status: 403 }
      );
    }

    // Parse request
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      );
    }

    // Get draft process
    const draftProcess = await getDraftProcess(slug);
    if (!draftProcess) {
      return NextResponse.json(
        { error: "Draft process not found" },
        { status: 404 }
      );
    }

    // Approve the draft process
    const approvedProcess = await approveDraftProcess(
      slug,
      session.user.email
    );

    if (!approvedProcess) {
      return NextResponse.json(
        { error: "Failed to approve process" },
        { status: 500 }
      );
    }

    console.log(`✅ Process approved: ${slug}`);

    // Automatically trigger Vercel deployment
    // This makes the process live without manual deployment
    const deployTriggered = await triggerVercelDeploy();

    const nextSteps = deployTriggered
      ? [
          "✅ Process approved",
          "🚀 Automatic deployment triggered",
          "⏳ Process will be live in 30-60 seconds",
        ]
      : [
          "✅ Process approved",
          "📝 Saved to /data/processes/" + slug + ".json",
          "⚠️ No automatic deployment configured",
          "💡 Add VERCEL_TOKEN and VERCEL_PROJECT_ID to .env for auto-deploy",
        ];

    return NextResponse.json(
      {
        success: true,
        message: `Process '${approvedProcess.title}' has been approved`,
        slug,
        process: approvedProcess,
        deployTriggered,
        nextSteps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving draft process:", error);
    return NextResponse.json(
      { error: "Failed to approve draft process" },
      { status: 500 }
    );
  }
}
