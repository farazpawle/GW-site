import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Clerk Webhook Handler
 * Syncs Clerk users to local PostgreSQL database
 * 
 * Events Handled:
 * - user.created: Create new user in database
 * - user.updated: Update existing user in database
 * - user.deleted: Delete user from database
 */

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET environment variable')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing svix headers')
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle the webhook event
  const eventType = evt.type

  try {
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name } = evt.data

      // Get primary email
      const primaryEmail = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id
      )

      if (!primaryEmail) {
        console.error('❌ No primary email found for user:', id)
        return new Response('No primary email', { status: 400 })
      }

      // Create user in database
      const user = await prisma.user.create({
        data: {
          id, // Clerk user ID
          email: primaryEmail.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
          role: 'VIEWER', // Default role
        },
      })

      console.log('✅ User created in database:', user.id)
      return new Response(JSON.stringify({ success: true, userId: user.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name } = evt.data

      // Get primary email
      const primaryEmail = email_addresses.find(
        (email) => email.id === evt.data.primary_email_address_id
      )

      if (!primaryEmail) {
        console.error('❌ No primary email found for user:', id)
        return new Response('No primary email', { status: 400 })
      }

      // Update user in database
      const user = await prisma.user.update({
        where: { id },
        data: {
          email: primaryEmail.email_address,
          name: first_name && last_name ? `${first_name} ${last_name}` : first_name || last_name || null,
        },
      })

      console.log('✅ User updated in database:', user.id)
      return new Response(JSON.stringify({ success: true, userId: user.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      if (!id) {
        console.error('❌ No user ID in delete event')
        return new Response('No user ID', { status: 400 })
      }

      // Delete user from database
      await prisma.user.delete({
        where: { id },
      })

      console.log('✅ User deleted from database:', id)
      return new Response(JSON.stringify({ success: true, userId: id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Event type not handled
    console.log('ℹ️ Unhandled webhook event type:', eventType)
    return new Response(JSON.stringify({ success: true, message: 'Event not handled' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
