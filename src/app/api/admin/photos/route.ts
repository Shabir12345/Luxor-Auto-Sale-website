// POST /api/admin/photos - Add photo to vehicle

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPhotoSchema } from '@/lib/validation';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createPhotoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Vehicle not found',
        },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary photos
    if (data.isPrimary) {
      await prisma.vehiclePhoto.updateMany({
        where: { vehicleId: data.vehicleId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create photo
    const photo = await prisma.vehiclePhoto.create({
      data,
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'ADDED_PHOTO',
        entityType: 'PHOTO',
        entityId: photo.id,
        details: { vehicleId: data.vehicleId },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: photo,
        message: 'Photo added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add photo error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

