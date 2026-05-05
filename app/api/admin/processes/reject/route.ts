import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { rejectDraftProcess, getDraftProcess } from "@/lib/db-processes";

/**
 * POST /api/admin/processes/reject
 * Reject and delete a draft process
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
    const { slug, reason } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      );
    }

    // Get draft first (for response)
    const draftProcess = await getDraftProcess(slug);
    if (!draftProcess) {
      return NextResponse.json(
        { error: "Draft process not found" },
        { status: 404 }
      );
    }

    // Reject the draft
    const success = await rejectDraftProcess(slug);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to reject process" },
        { status: 500 }
      );
    }

    console.log(`✅ Process rejected: ${slug}`);
    if (reason) {
      console.log(`   Reason: ${reason}`);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Process '${draftProcess.title}' has been rejected and deleted`,
        slug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting draft process:", error);
    return NextResponse.json(
      { error: "Failed to reject draft process" },
      { status: 500 }
    );
  }
}
