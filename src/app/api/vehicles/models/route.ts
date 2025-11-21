import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const make = searchParams.get('make');

    if (!prisma) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Database connection not initialized' },
        { status: 500 }
      );
    }

    const where = make ? { make: { equals: make, mode: 'insensitive' as const } } : {};

    // Get distinct models
    const rawModels = await prisma.vehicle.findMany({
      where,
      select: {
        model: true,
      },
      distinct: ['model'],
      orderBy: {
        model: 'asc',
      },
    });

    // Normalize and deduplicate
    const models = Array.from(new Set(
      rawModels
        .map(v => v.model?.trim())
        .filter(Boolean)
    )).sort();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: models,
    });

  } catch (error) {
    console.error('Get models error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

