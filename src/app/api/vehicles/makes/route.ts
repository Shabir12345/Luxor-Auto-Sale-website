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

    // Get all makes (not just available) to show in filters
    const makes = await prisma.vehicle.findMany({
      select: {
        make: true,
      },
      distinct: ['make'],
      orderBy: {
        make: 'asc',
      },
    });

    // Remove duplicates case-insensitively and normalize
    const makeMap = new Map<string, string>();
    makes.forEach((v) => {
      if (v.make) {
        const normalized = v.make.trim().toLowerCase();
        if (!makeMap.has(normalized)) {
          // Keep the first occurrence (which should be properly capitalized from DB)
          makeMap.set(normalized, v.make.trim());
        }
      }
    });

    const makeList = Array.from(makeMap.values()).sort((a, b) => 
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

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
