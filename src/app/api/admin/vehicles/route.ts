// POST /api/admin/vehicles - Create new vehicle (Protected)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createVehicleSchema } from '@/lib/validation';
import { generateVehicleSlug } from '@/utils/slugify';
import { ApiResponse } from '@/types';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
    console.log('Received vehicle data:', JSON.stringify(body, null, 2));
    
    const validation = createVehicleSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation errors:', validation.error.errors);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if VIN already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vin: data.vin },
    });

    if (existingVehicle) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Vehicle with this VIN already exists',
        },
        { status: 409 }
      );
    }

    // Generate SEO slug
    const seoSlug = generateVehicleSlug(data.year, data.make, data.model, data.vin);

    // Create vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        seoSlug,
        title: data.title || `${data.year} ${data.make} ${data.model}`,
        createdById: payload.userId,
        publishedAt: data.status === 'AVAILABLE' ? new Date() : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: payload.userId,
        action: 'CREATED_VEHICLE',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: { vin: vehicle.vin, title: vehicle.title },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: vehicle,
        message: 'Vehicle created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/vehicles - List vehicles (all statuses)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const perPage = searchParams.get('perPage') ? parseInt(searchParams.get('perPage')!) : 100;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const skip = (page - 1) * perPage;

    const total = await prisma.vehicle.count();
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: perPage,
      include: {
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        data: vehicles,
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Admin list vehicles error:', error);
    return NextResponse.json<ApiResponse>({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

