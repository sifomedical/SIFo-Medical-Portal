import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import {
  getAllPendingUsers,
  getAllApprovedUsers,
  getAllRejectedUsers,
} from "@/lib/db-users";

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession()) as any;
    const adminEmail = process.env.ADMIN_EMAIL || "";

    // Check if user is admin
    if (!session || session.user?.email !== adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pending = getAllPendingUsers();
    const approved = getAllApprovedUsers();
    const rejected = getAllRejectedUsers();

    return NextResponse.json(
      {
        pending,
        approved,
        rejected,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
