// POST /api/admin/upload - Upload vehicle image

import { NextRequest, NextResponse } from 'next/server';
import { uploadVehicleImage, validateImageFile } from '@/lib/storage';
import { ApiResponse } from '@/types';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify auth here (Node runtime)
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'File is required',
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

    // Use Cloudflare R2 / S3-compatible storage
    const vehicleId = (formData.get('vehicleId') as string) || 'temp';
    // Debug config (safe to log lengths/domains only)
    console.log('R2 config check:', {
      account: process.env.R2_ACCOUNT_ID ? 'set' : 'missing',
      bucket: process.env.R2_BUCKET,
      publicUrl: process.env.R2_PUBLIC_URL,
    });

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
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Upload failed: ${error?.name || 'Error'} - ${error?.message || 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}

