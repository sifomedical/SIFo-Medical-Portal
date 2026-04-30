import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { updateUserStatus } from "@/lib/db-users";

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession()) as any;
    const adminEmail = process.env.ADMIN_EMAIL || "";

    // Check if user is admin
    if (!session || session.user?.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const updatedUser = updateUserStatus(email, "approved", adminEmail);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `User ${email} approved`,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
