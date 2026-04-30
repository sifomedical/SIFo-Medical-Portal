import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { Process } from "@/types/process";

export async function POST(req: NextRequest) {
  try {
    // Check authentication and approval status
    const session = (await getServerSession()) as any;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.approvalStatus !== "approved") {
      return NextResponse.json(
        { error: "Account not approved" },
        { status: 403 }
      );
    }

    const processData: Process = await req.json();
    const dropboxToken = process.env.DROPBOX_API_TOKEN;

    if (!dropboxToken) {
      return NextResponse.json(
        { error: "Dropbox API token not configured" },
        { status: 500 }
      );
    }

    const slug = processData.slug;
    const filename = `${slug}.json`;

    // Upload to Dropbox
    const dropboxResponse = await fetch(
      "https://content.dropboxapi.com/2/files/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dropboxToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            path: `/data/processes/${filename}`,
            mode: "add",
            autorename: false,
            mute: false,
          }),
          "Content-Type": "application/octet-stream",
        },
        body: JSON.stringify(processData),
      }
    );

    if (!dropboxResponse.ok) {
      const error = await dropboxResponse.text();
      console.error("Dropbox error:", error);
      return NextResponse.json(
        { error: "Failed to save to Dropbox", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `✅ Prozess "${processData.title}" gespeichert: ${filename}`,
        filename,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Process creation error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
