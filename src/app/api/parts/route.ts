import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { partCreateSchema } from '@/lib/validation'
import { handleApiError, successResponse } from '@/lib/error-handler'
import { NotFoundError, ConflictError } from '@/lib/errors'

const prisma = new PrismaClient()

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
        { partNumber: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
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

    return successResponse({
      parts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return handleApiError(error)
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input using centralized schema
    const data = partCreateSchema.parse(body)
    
    // Check if slug already exists
    const existingPart = await prisma.part.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingPart) {
      throw new ConflictError('A part with this slug already exists', 'DUPLICATE_SLUG')
    }
    
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })
    
    if (!category) {
      throw new NotFoundError('Category not found', 'CATEGORY_NOT_FOUND')
    }
    
    // Create part
    const part = await prisma.part.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description?.trim() || null,
        shortDesc: data.shortDesc?.trim() || null,
        partNumber: data.partNumber.trim(),
        sku: data.sku.trim(),
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

    return successResponse(part, 'Part created successfully', 201)
  } catch (error) {
    return handleApiError(error)
  } finally {
    await prisma.$disconnect()
  }
}