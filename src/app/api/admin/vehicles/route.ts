// POST /api/admin/vehicles - Create new vehicle (Protected)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createVehicleSchema } from '@/lib/validation';
import { generateVehicleSlug } from '@/utils/slugify';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createVehicleSchema.safeParse(body);

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
        createdById: userId,
        publishedAt: data.status === 'AVAILABLE' ? new Date() : null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
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

