import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * Sync Clerk users to local database
 * GET /api/admin/sync-clerk-users
 */
export async function GET() {
  try {
    const client = await clerkClient()
    const clerkUsers = await client.users.getUserList()

    console.log(`📥 Found ${clerkUsers.data.length} users in Clerk`)

    const syncedUsers = []

    for (const user of clerkUsers.data) {
      const email = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
      )?.emailAddress

      if (!email) {
        console.log(`⚠️ Skipping user ${user.id} - no primary email`)
        continue
      }

      const fullName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || null

      const syncedUser = await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email,
          name: fullName,
        },
        create: {
          id: user.id,
          email,
          name: fullName,
          role: 'VIEWER',
        },
      })

      syncedUsers.push(syncedUser)
      console.log(`✅ Synced: ${syncedUser.email} (${syncedUser.id})`)
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedUsers.length} users`,
      users: syncedUsers.map((u) => ({ id: u.id, email: u.email, role: u.role })),
    })
  } catch (error) {
    console.error('❌ Error syncing users:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
