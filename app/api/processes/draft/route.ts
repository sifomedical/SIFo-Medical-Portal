import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { saveDraftProcess } from "@/lib/db-processes";
import { Process } from "@/types/process";

/**
 * POST /api/processes/draft
 * Save a new draft process
 * Requires: authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession()) as any;
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in" },
        { status: 401 }
      );
    }

    // Parse request body
    const processData = (await request.json()) as Process;

    // Validate required fields
    const requiredFields = [
      "id",
      "slug",
      "title",
      "subtitle",
      "category",
      "description",
      "goals",
      "steps",
      "tools",
      "owner",
      "frequency",
      "lastUpdated",
      "mermaidDiagram",
      "tags",
    ];

    for (const field of requiredFields) {
      if (!processData[field as keyof Process]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Ensure status is draft
    processData.status = "draft";
    processData.lastUpdated = new Date().toISOString();

    // Save to KV
    await saveDraftProcess(processData, session.user.email);

    return NextResponse.json(
      {
        success: true,
        slug: processData.slug,
        message: "Draft process saved successfully",
        status: "pending_approval",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving draft process:", error);
    return NextResponse.json(
      { error: "Failed to save draft process" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/processes/draft?slug=...
 * Get a specific draft process (creator or admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession()) as any;
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(
        { error: "slug parameter required" },
        { status: 400 }
      );
    }

    const { getDraftProcess } = await import("@/lib/db-processes");
    const draftProcess = await getDraftProcess(slug);

    if (!draftProcess) {
      return NextResponse.json(
        { error: "Draft process not found" },
        { status: 404 }
      );
    }

    // Check if user is creator or admin
    const isAdmin = session.user.email === process.env.ADMIN_EMAIL;
    const isCreator =
      draftProcess.createdBy.toLowerCase() ===
      session.user.email.toLowerCase();

    if (!isAdmin && !isCreator) {
      return NextResponse.json(
        { error: "Forbidden - not creator or admin" },
        { status: 403 }
      );
    }

    return NextResponse.json(draftProcess, { status: 200 });
  } catch (error) {
    console.error("Error fetching draft process:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft process" },
      { status: 500 }
    );
  }
}
