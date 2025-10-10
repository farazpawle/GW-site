import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for part creation
const partSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200, 'Name is too long'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(200, 'Slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().max(5000, 'Description is too long').optional(),
  shortDesc: z.string().max(500, 'Short description is too long').optional(),
  partNumber: z.string().min(1, 'Part number is required').max(100, 'Part number is too long'),
  price: z.number().positive('Price must be positive'),
  comparePrice: z.number().positive().optional(),
  inStock: z.boolean().default(true),
  stockQuantity: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  compatibility: z.array(z.string()).optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  featured: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    
    const skip = (page - 1) * limit

    const where: Prisma.PartWhereInput = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (featured === 'true') {
      where.featured = true
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [parts, total] = await Promise.all([
      prisma.part.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.part.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: parts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching parts:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = partSchema.safeParse(body)
    
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
    
    // Check if slug already exists
    const existingPart = await prisma.part.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingPart) {
      return NextResponse.json(
        { error: 'A part with this slug already exists' },
        { status: 409 }
      )
    }
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Create part
    const part = await prisma.part.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description?.trim() || null,
        shortDesc: data.shortDesc?.trim() || null,
        partNumber: data.partNumber.trim(),
        price: data.price,
        comparePrice: data.comparePrice || null,
        inStock: data.inStock,
        stockQuantity: data.stockQuantity || 0,
        images: data.images || [],
        specifications: data.specifications || {},
        compatibility: data.compatibility || [],
        categoryId: data.categoryId,
        featured: data.featured
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Part created successfully',
        data: part
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating part:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}