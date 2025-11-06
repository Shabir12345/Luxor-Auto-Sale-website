// GET /api/admin/photos - List photos (Protected)
// POST /api/admin/photos - Create photo (Protected)
// DELETE /api/admin/photos - Delete all photos for a vehicle (Protected)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPhotoSchema } from '@/lib/validation';
import { ApiResponse } from '@/types';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { deleteVehicleImage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const vehicleId = searchParams.get('vehicleId');

    const where = vehicleId ? { vehicleId } : {};

    const photos = await prisma.vehiclePhoto.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: photos,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createPhotoSchema.safeParse(body);

    if (!validation.success) {
      // Log detailed validation errors for debugging
      console.error('Photo validation failed:', {
        errors: validation.error.errors,
        receivedData: {
          vehicleId: body.vehicleId,
          url: body.url?.substring(0, 100), // Log first 100 chars of URL
          urlLength: body.url?.length,
          altText: body.altText,
          sortOrder: body.sortOrder,
          isPrimary: body.isPrimary,
        },
      });
      
      // Provide more helpful error messages
      const firstError = validation.error.errors[0];
      let errorMessage = firstError.message;
      
      // Customize error messages for common issues
      if (firstError.path.includes('vehicleId')) {
        errorMessage = `Invalid vehicle ID format: ${body.vehicleId}. Please ensure you're uploading to a valid vehicle.`;
      } else if (firstError.path.includes('url')) {
        errorMessage = `Invalid image URL format. The uploaded image URL doesn't match the expected pattern. URL: ${body.url?.substring(0, 50)}...`;
      }
      
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If this is being set as primary, unset other primaries for this vehicle
    if (data.isPrimary) {
      await prisma.vehiclePhoto.updateMany({
        where: { vehicleId: data.vehicleId },
        data: { isPrimary: false },
      });
    }

    // Create photo
    const photo = await prisma.vehiclePhoto.create({
      data,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: photo,
        message: 'Photo created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create photo error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'vehicleId is required',
        },
        { status: 400 }
      );
    }

    // Get all photos for this vehicle
    const photos = await prisma.vehiclePhoto.findMany({
      where: { vehicleId },
    });

    // Delete all image files
    for (const photo of photos) {
      if (photo.url) {
        try {
          await deleteVehicleImage(photo.url);
        } catch (error) {
          console.error(`Error deleting image file for photo ${photo.id}:`, error);
          // Continue even if file deletion fails
        }
      }
    }

    // Delete all photo records
    const deleteResult = await prisma.vehiclePhoto.deleteMany({
      where: { vehicleId },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { deletedCount: deleteResult.count },
        message: `Successfully deleted ${deleteResult.count} ${deleteResult.count === 1 ? 'photo' : 'photos'}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete all photos error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}