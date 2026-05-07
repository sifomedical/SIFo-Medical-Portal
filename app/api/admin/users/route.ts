import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getAllPendingUsers, getAllApprovedUsers, getAllRejectedUsers } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    // Check if user is authenticated
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch users by status
    const [pendingUsers, approvedUsers, rejectedUsers] = await Promise.all([
      getAllPendingUsers(),
      getAllApprovedUsers(),
      getAllRejectedUsers(),
    ])

    return NextResponse.json({
      pending: pendingUsers,
      approved: approvedUsers,
      rejected: rejectedUsers,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
