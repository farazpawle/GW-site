import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin, checkPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProductSchema, generateSlug } from '@/lib/validations/product';
import { DEFAULT_IMAGES } from '@/lib/default-images';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/parts
 * Get list of products with search, filter, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const user = await checkPermission('products.view');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    const stockFilter = searchParams.get('stock') || ''; // 'inStock', 'outOfStock', or ''
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const whereConditions: Prisma.PartWhereInput[] = [];
    
    // Search filter
    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { partNumber: { contains: search, mode: 'insensitive' } },
        ],
      });
    }
    
    // Category filter
    if (categoryId) {
      whereConditions.push({ categoryId });
    }
    
    // Stock filter
    if (stockFilter === 'inStock') {
      whereConditions.push({ inStock: true } as Prisma.PartWhereInput);
    } else if (stockFilter === 'outOfStock') {
      whereConditions.push({ inStock: false } as Prisma.PartWhereInput);
    }
    
    const where: Prisma.PartWhereInput = whereConditions.length > 0 
      ? { AND: whereConditions }
      : {};

    // Execute query with pagination
    const [parts, totalCount] = await Promise.all([
      prisma.part.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.part.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Convert Decimal objects to plain numbers for Client Components
    const serializedParts = parts.map((part) => ({
      ...part,
      price: Number(part.price),
      comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
    }));

    return NextResponse.json({
      success: true,
      data: serializedParts,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Error fetching parts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/parts
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const user = await checkPermission('products.create');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createProductSchema.parse(body);

    // Generate slug from name
    const slug = generateSlug(validatedData.name);

    // Check for duplicate part number
    const existingPart = await prisma.part.findUnique({
      where: { partNumber: validatedData.partNumber },
    });

    if (existingPart) {
      return NextResponse.json(
        { success: false, error: 'A product with this part number already exists' },
        { status: 409 }
      );
    }

    // Check for duplicate slug
    const existingSlug = await prisma.part.findUnique({
      where: { slug },
    });

    // If slug exists, append random suffix
    const finalSlug = existingSlug 
      ? `${slug}-${Math.random().toString(36).substring(2, 8)}`
      : slug;

    // Ensure images array has at least the default image if empty
    // This creates a fluent chain: Form submits empty array → API inserts default → DB stores default → Frontend displays from DB
    const images = validatedData.images && validatedData.images.length > 0
      ? validatedData.images
      : [DEFAULT_IMAGES.PRODUCT];

    // Create product with all validated fields including inventory
    const part = await prisma.part.create({
      data: {
        ...validatedData,
        images,
        slug: finalSlug,
        specifications: validatedData.specifications || Prisma.JsonNull,
      },
      include: { category: true },
    });

    // Convert Decimal objects to plain numbers
    const serializedPart = {
      ...part,
      price: Number(part.price),
      comparePrice: part.comparePrice ? Number(part.comparePrice) : null,
    };

    return NextResponse.json(
      { success: true, data: serializedPart },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating part:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
