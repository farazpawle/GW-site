import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { contactMessageSchema } from '@/lib/validation'
import { handleApiError, successResponse } from '@/lib/error-handler'
import { BadRequestError } from '@/lib/errors'
import { applyRateLimit, contactRateLimiter } from '@/lib/rate-limit'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 3 requests per hour per IP
    const rateLimitResponse = applyRateLimit(request, contactRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json()
    console.log('📝 Contact form submission received:', body)
    
    // Honeypot check - reject if filled (bot detected)
    if (body.website && body.website.trim() !== '') {
      console.warn('🤖 Bot detected via honeypot field')
      throw new BadRequestError('Invalid submission', 'BOT_DETECTED')
    }
    
    // Validate input using centralized schema
    const data = contactMessageSchema.parse(body)
    console.log('✅ Validation passed, saving to database...')
    
    // Sanitize and save message
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || null,
        message: data.message.trim()
      }
    })

    console.log('✅ Message saved successfully with ID:', message.id)
    
    return successResponse(
      { id: message.id },
      'Your message has been received. We will get back to you soon!',
      201
    )
  } catch (error) {
    return handleApiError(error)
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication check here
    // const session = await getServerSession()
    // if (!session) throw new UnauthorizedError()
    
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

    return successResponse({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  } finally {
    await prisma.$disconnect()
  }
}