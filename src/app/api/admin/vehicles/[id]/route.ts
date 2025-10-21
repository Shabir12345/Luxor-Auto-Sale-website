// PATCH /api/admin/vehicles/[id] - Update vehicle
// DELETE /api/admin/vehicles/[id] - Delete vehicle

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateVehicleSchema } from '@/lib/validation';
import { generateVehicleSlug } from '@/utils/slugify';
import { ApiResponse } from '@/types';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Vehicle not found',
        },
        { status: 404 }
      );
    }

    const validation = updateVehicleSchema.safeParse({ ...body, id });

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { id: _, ...data } = validation.data;

    // Update slug if make/model/year changed
    let seoSlug = existingVehicle.seoSlug;
    if (data.year || data.make || data.model) {
      seoSlug = generateVehicleSlug(
        data.year || existingVehicle.year,
        data.make || existingVehicle.make,
        data.model || existingVehicle.model,
        existingVehicle.vin
      );
    }

    // Update publishedAt if status changed to AVAILABLE
    const publishedAt =
      data.status === 'AVAILABLE' && !existingVehicle.publishedAt
        ? new Date()
        : existingVehicle.publishedAt;

    // Update vehicle
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...data,
        seoSlug,
        publishedAt,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'UPDATED_VEHICLE',
        entityType: 'VEHICLE',
        entityId: vehicle.id,
        details: { changes: data },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: vehicle,
        message: 'Vehicle updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'OWNER') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Vehicle not found',
        },
        { status: 404 }
      );
    }

    // Delete vehicle (cascade will delete photos and features)
    await prisma.vehicle.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'DELETED_VEHICLE',
        entityType: 'VEHICLE',
        entityId: id,
        details: { vin: existingVehicle.vin, title: existingVehicle.title },
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Vehicle deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

