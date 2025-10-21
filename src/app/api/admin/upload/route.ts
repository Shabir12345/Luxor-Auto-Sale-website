// POST /api/admin/upload - Upload vehicle image

import { NextRequest, NextResponse } from 'next/server';
import { uploadVehicleImage, validateImageFile } from '@/lib/storage';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vehicleId = formData.get('vehicleId') as string;

    if (!file || !vehicleId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'File and vehicleId are required',
        },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.error,
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3/R2
    const { urls, primaryUrl } = await uploadVehicleImage(buffer, vehicleId, file.name);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          url: primaryUrl,
          urls,
        },
        message: 'Image uploaded successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}

