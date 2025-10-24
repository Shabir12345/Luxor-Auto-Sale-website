// GET /api/vehicles/featured - Get featured vehicles

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 3;

    // Get featured vehicles (fallback to first 6 available if no featured vehicles)
    const featuredVehicles = await prisma.vehicle.findMany({
      where: {
        status: 'AVAILABLE',
        isFeatured: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        photos: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    console.log('Featured vehicles found:', featuredVehicles.length);
    console.log('Featured vehicles details:', featuredVehicles.map(v => ({ 
      id: v.id, 
      title: v.title, 
      make: v.make,
      model: v.model,
      year: v.year,
      isFeatured: v.isFeatured 
    })));

    // If we don't have enough featured vehicles, get additional available vehicles
    let vehicles = featuredVehicles;
    if (vehicles.length < limit) {
      const additionalVehicles = await prisma.vehicle.findMany({
        where: {
          status: 'AVAILABLE',
          isFeatured: false,
          id: {
            notIn: vehicles.map(v => v.id),
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit - vehicles.length,
        include: {
          photos: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      });
      vehicles = [...vehicles, ...additionalVehicles];
      console.log('Additional vehicles added:', additionalVehicles.map(v => ({ 
        id: v.id, 
        title: v.title, 
        make: v.make,
        model: v.model,
        year: v.year,
        isFeatured: v.isFeatured 
      })));
    }

    console.log('Total vehicles returned:', vehicles.length);
    console.log('Final vehicles list:', vehicles.map(v => ({ 
      id: v.id, 
      title: v.title, 
      make: v.make,
      model: v.model,
      year: v.year,
      isFeatured: v.isFeatured 
    })));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: vehicles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get featured vehicles error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
