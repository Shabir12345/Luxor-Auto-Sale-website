// Debug endpoint to check featured vehicles in database

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all vehicles with their featured status
    const allVehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        year: true,
        isFeatured: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get only featured vehicles
    const featuredVehicles = allVehicles.filter(v => v.isFeatured === true);

    return NextResponse.json({
      success: true,
      data: {
        totalVehicles: allVehicles.length,
        featuredVehicles: featuredVehicles.length,
        allVehicles: allVehicles,
        featuredOnly: featuredVehicles,
      },
    });
  } catch (error) {
    console.error('Debug featured vehicles error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
