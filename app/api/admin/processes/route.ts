import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAllDraftProcesses } from "@/lib/db-processes";

/**
 * GET /api/admin/processes
 * List all draft processes (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin status
    const session = (await getServerSession()) as any;
    console.log("🔐 Session:", session?.user?.email);
    console.log("🔑 ADMIN_EMAIL env:", process.env.ADMIN_EMAIL);

    if (!session || !session.user?.email) {
      console.error("❌ No session found");
      return NextResponse.json(
        { error: "Unauthorized - no session" },
        { status: 401 }
      );
    }

    const isAdmin =
      session.user.email === process.env.ADMIN_EMAIL ||
      session.user.email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

    console.log("👤 User email:", session.user.email);
    console.log("✅ Is admin?", isAdmin);

    if (!isAdmin) {
      return NextResponse.json(
        { error: `Forbidden - admin only. Your email: ${session.user.email}` },
        { status: 403 }
      );
    }

    // Get all draft processes
    const drafts = await getAllDraftProcesses();
    console.log("📋 Found drafts:", drafts.length);

    return NextResponse.json(
      {
        drafts,
        count: drafts.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error fetching draft processes:", errorMsg, error);
    return NextResponse.json(
      { error: "Failed to fetch draft processes: " + errorMsg },
      { status: 500 }
    );
  }
}
