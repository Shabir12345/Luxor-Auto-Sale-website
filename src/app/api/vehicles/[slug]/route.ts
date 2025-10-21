// GET /api/vehicles/[slug] - Get single vehicle by slug

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { seoSlug: slug },
      include: {
        photos: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        features: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
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

    // Only show published vehicles to public
    if (vehicle.status === 'DRAFT' && !request.headers.get('x-user-id')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Vehicle not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: vehicle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get vehicle error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

