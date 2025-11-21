// GET /api/admin/vehicles/[id] - Get vehicle
// PATCH /api/admin/vehicles/[id] - Update vehicle
// DELETE /api/admin/vehicles/[id] - Delete vehicle

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateVehicleSchema } from '@/lib/validation';
import { generateVehicleSlug } from '@/utils/slugify';
import { ApiResponse } from '@/types';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { sortOrder: 'asc' },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    console.log('Update vehicle request:', { id, body });

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
      console.error('Validation error:', validation.error.errors);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { id: _, ...data } = validation.data;

    // Filter out undefined values to ensure Prisma only updates provided fields
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as any;

    // Update slug if make/model/year changed
    let seoSlug = existingVehicle.seoSlug;
    if (updateData.year || updateData.make || updateData.model) {
      seoSlug = generateVehicleSlug(
        updateData.year || existingVehicle.year,
        updateData.make || existingVehicle.make,
        updateData.model || existingVehicle.model,
        existingVehicle.vin
      );
      updateData.seoSlug = seoSlug;
    }

    // Update publishedAt if status changed to AVAILABLE
    if (updateData.status === 'AVAILABLE' && !existingVehicle.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Update vehicle
    console.log('Updating vehicle with data:', updateData);
    try {
      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: updateData,
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: payload.userId,
          action: 'UPDATED_VEHICLE',
          entityType: 'VEHICLE',
          entityId: vehicle.id,
          details: { changes: updateData },
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
    } catch (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`,
        },
        { status: 500 }
      );
    }
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
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;

    if (!payload || payload.role !== 'OWNER') {
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
        userId: payload.userId,
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

