// GET /api/vehicles/makes - Get available vehicle makes

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Database connection not initialized',
        },
        { status: 500 }
      );
    }

    // Get distinct makes efficiently
    const makes = await prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
      },
      select: {
        make: true,
      },
      distinct: ['make'],
      orderBy: {
        make: 'asc',
      },
    });

    const makeList = makes.map((v) => v.make).filter(Boolean);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: makeList,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get makes error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
