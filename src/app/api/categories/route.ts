import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema for category creation
const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').max(100, 'Slug is too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().max(500, 'Description is too long').optional(),
  image: z.string().url('Invalid image URL').optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    
    const categories = await prisma.category.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        _count: {
          select: { parts: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
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
    const validationResult = categorySchema.safeParse(body)
    
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
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 409 }
      )
    }
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name: data.name.trim(),
        slug: data.slug.toLowerCase().trim(),
        description: data.description?.trim() || null,
        image: data.image || null
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        data: category
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}