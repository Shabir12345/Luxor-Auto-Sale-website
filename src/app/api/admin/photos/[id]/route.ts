// GET /api/admin/photos/[id] - Get photo (Protected)
// PUT /api/admin/photos/[id] - Update photo (Protected)
// DELETE /api/admin/photos/[id] - Delete photo (Protected)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updatePhotoSchema } from '@/lib/validation';
import { ApiResponse } from '@/types';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const photo = await prisma.vehiclePhoto.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Photo not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: photo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get photo error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

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

    const validation = updatePhotoSchema.safeParse({ ...body, id });

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { id: _, ...data } = validation.data;

    // If this is being set as primary, unset other primaries for this vehicle
    if (data.isPrimary) {
      await prisma.vehiclePhoto.updateMany({
        where: { 
          vehicleId: existingPhoto.vehicleId,
          id: { not: id }
        },
        data: { isPrimary: false },
      });
    }

    // Update photo
    const photo = await prisma.vehiclePhoto.update({
      where: { id },
      data,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: photo,
        message: 'Photo updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update photo error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
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