import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { updateUserStatus } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 APPROVE ENDPOINT CALLED");

    const session = await getServerSession()

    console.log("📊 SESSION:", {
      hasSession: !!session,
      email: session?.user?.email,
    });

    // Check if user is authenticated
    if (!session?.user?.email) {
      console.log("❌ NO SESSION");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL
    console.log("👤 ADMIN CHECK:", {
      sessionEmail: session.user.email,
      adminEmail,
      isAdmin: session.user.email === adminEmail,
    });

    if (session.user.email !== adminEmail) {
      console.log("❌ NOT ADMIN");
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    console.log("📧 UPDATE REQUEST FOR:", email);

    if (!email) {
      console.log("❌ NO EMAIL");
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Update user status
    console.log("🔄 CALLING UPDATE USER STATUS");
    const updatedUser = await updateUserStatus(
      email,
      'approved',
      session.user.email
    )

    console.log("📊 UPDATE RESULT:", {
      success: !!updatedUser,
      email: updatedUser?.email,
      status: updatedUser?.status,
    });

    if (!updatedUser) {
      console.log("❌ USER NOT FOUND");
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log("✅ APPROVE SUCCESS");
    return NextResponse.json({
      success: true,
      message: `User ${email} approved`,
      user: updatedUser,
    })
  } catch (error) {
    console.error('❌ ERROR APPROVING USER:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
