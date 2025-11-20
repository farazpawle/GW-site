/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for status update
const updateStatusSchema = z.object({
  status: z.enum(['UNREAD', 'READ', 'REPLIED'])
});

/**
 * GET /api/admin/messages/[id]
 * Get a single contact message by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkPermission('messages.view');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const message = await prisma.contactMessage.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true
      }
    });

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/messages/[id]
 * Update message status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkPermission('messages.edit');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await req.json();
    
    // Validate request body
    const validation = updateStatusSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid status value',
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = { status: validation.data.status };
    
    // Set repliedAt timestamp when marking as REPLIED
    if (validation.data.status === 'REPLIED') {
      updateData.repliedAt = new Date();
    }

    // Update message status
    const message = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        message: true,
        status: true,
        createdAt: true
      } as any // Type assertion until TS server reloads - repliedAt is included but TS doesn't know yet
    });

    return NextResponse.json({
      success: true,
      data: message,
      message: `Message marked as ${validation.data.status}`
    });

  } catch (error: any) {
    console.error('Error updating message:', error);
    
    // Handle Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * Delete a contact message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await checkPermission('messages.delete');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.contactMessage.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting message:', error);
    
    // Handle Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
