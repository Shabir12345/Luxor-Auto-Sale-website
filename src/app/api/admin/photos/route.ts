// GET /api/admin/photos - List photos (Protected)
// POST /api/admin/photos - Create photo (Protected)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPhotoSchema } from '@/lib/validation';
import { ApiResponse } from '@/types';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

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
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
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