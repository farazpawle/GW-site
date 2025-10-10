import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema
const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message is too long'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = contactMessageSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Sanitize and save message
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject.trim(),
        message: data.message.trim()
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been received. We will get back to you soon!',
        id: message.id 
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error('Error saving contact message:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const session = await getServerSession()
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // Pagination support
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit
    
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          createdAt: true,
          // Exclude phone for security if not needed
        }
      }),
      prisma.contactMessage.count()
    ])

    return NextResponse.json({
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}