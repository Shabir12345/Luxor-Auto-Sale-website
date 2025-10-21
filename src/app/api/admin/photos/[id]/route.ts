// DELETE /api/admin/photos/[id] - Delete photo

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if photo exists
    const existingPhoto = await prisma.vehiclePhoto.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Photo not found',
        },
        { status: 404 }
      );
    }

    // Delete photo
    await prisma.vehiclePhoto.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETED_PHOTO',
        entityType: 'PHOTO',
        entityId: id,
        details: { vehicleId: existingPhoto.vehicleId, url: existingPhoto.url },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Photo deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

