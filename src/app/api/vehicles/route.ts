// GET /api/vehicles - Public vehicle listing with filters

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vehicleFiltersSchema } from '@/lib/validation';
import { ApiResponse, PaginatedResponse } from '@/types';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const sortByParam = searchParams.get('sortBy') || 'newest';
    
    // Convert new sort values to validation schema values
    let sortBy: 'price' | 'year' | 'odometer' | 'createdAt' = 'createdAt';
    let sortOrder: 'asc' | 'desc' = 'desc';
    
    switch (sortByParam) {
      case 'newest':
        sortBy = 'createdAt';
        sortOrder = 'desc';
        break;
      case 'oldest':
        sortBy = 'createdAt';
        sortOrder = 'asc';
        break;
      case 'price-low':
        sortBy = 'price';
        sortOrder = 'asc';
        break;
      case 'price-high':
        sortBy = 'price';
        sortOrder = 'desc';
        break;
      case 'mileage-low':
        sortBy = 'odometer';
        sortOrder = 'asc';
        break;
      case 'mileage-high':
        sortBy = 'odometer';
        sortOrder = 'desc';
        break;
      default:
        sortBy = 'createdAt';
        sortOrder = 'desc';
    }
    
    const params = {
      make: searchParams.get('make') || undefined,
      model: searchParams.get('model') || undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      minYear: searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined,
      maxYear: searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined,
      minPrice: searchParams.get('minPrice')
        ? parseInt(searchParams.get('minPrice')!)
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? parseInt(searchParams.get('maxPrice')!)
        : undefined,
      maxMileage: searchParams.get('maxMileage')
        ? parseInt(searchParams.get('maxMileage')!)
        : undefined,
      bodyType: searchParams.get('bodyType') || undefined,
      drivetrain: searchParams.get('drivetrain') || undefined,
      fuelType: searchParams.get('fuelType') || undefined,
      transmission: searchParams.get('transmission') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      perPage: searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : 12,
      sortBy,
      sortOrder,
    };

    // Validate
    const validation = vehicleFiltersSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Build where clause
    const where: Prisma.VehicleWhereInput = {
      // Only filter by status if explicitly requested, otherwise show all
      ...(filters.status && filters.status !== 'ALL' && { status: filters.status as any }),
      ...(filters.make && { make: { contains: filters.make, mode: 'insensitive' } }),
      ...(filters.model && { model: { contains: filters.model, mode: 'insensitive' } }),
      // Note: year filtering is handled by minYear/maxYear
      ...(filters.minYear && { year: { gte: filters.minYear } }),
      ...(filters.maxYear && { year: { lte: filters.maxYear } }),
      ...(filters.minPrice && { priceCents: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { priceCents: { lte: filters.maxPrice } }),
      ...(filters.maxMileage && { odometerKm: { lte: filters.maxMileage } }),
      ...(filters.bodyType && { bodyType: filters.bodyType as any }),
      ...(filters.drivetrain && { drivetrain: filters.drivetrain as any }),
      ...(filters.fuelType && { fuelType: filters.fuelType as any }),
      ...(filters.transmission && { transmission: filters.transmission as any }),
      ...(filters.search && {
        OR: [
          { make: { contains: filters.search, mode: 'insensitive' } },
          { model: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Build order by
    const orderBy: Prisma.VehicleOrderByWithRelationInput = {
      [filters.sortBy]: filters.sortOrder,
    };

    // Count total
    const total = await prisma.vehicle.count({ where });

    // Get paginated results
    const skip = (filters.page - 1) * filters.perPage;
    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take: filters.perPage,
      include: {
        photos: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });


    const response: PaginatedResponse<any> = {
      data: vehicles,
      pagination: {
        page: filters.page,
        perPage: filters.perPage,
        total,
        totalPages: Math.ceil(total / filters.perPage),
      },
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get vehicles error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

