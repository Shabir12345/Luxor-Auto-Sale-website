// POST /api/admin/upload - Upload vehicle image

import { NextRequest, NextResponse } from 'next/server';
import { uploadVehicleImage, validateImageFile } from '@/lib/storage';
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
    
    // Validate vehicleId format (basic check)
    if (vehicleId !== 'temp' && vehicleId.length < 10) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid vehicle ID format',
        },
        { status: 400 }
      );
    }
    
    // Debug config (safe to log lengths/domains only)
    console.log('Upload request:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      vehicleId: vehicleId.substring(0, 10) + '...', // Only log partial ID
      hasR2: !!process.env.R2_ACCOUNT_ID,
      hasAws: !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY),
    });

    let uploadedUrls: { urls: Record<string, string>; primaryUrl: string } | null = null;
    
    try {
      uploadedUrls = await uploadVehicleImage(buffer, vehicleId, file.name);
    } catch (uploadError: any) {
      // If upload fails, provide helpful error message
      console.error('Image upload failed:', uploadError);
      
      // Check for specific error types
      if (uploadError.message?.includes('HEIC') || uploadError.message?.includes('HEIF')) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: uploadError.message,
          },
          { status: 400 }
        );
      }
      
      if (uploadError.message?.includes('unsupported image format')) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: uploadError.message,
          },
          { status: 400 }
        );
      }
      
      // Generic upload error
      throw uploadError;
    }

    const { urls, primaryUrl } = uploadedUrls;

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
    
    // Provide helpful error messages for common credential issues
    let errorMessage = error?.message || 'Unknown error';
    if (errorMessage.includes('Credential access key has length')) {
      errorMessage = 'R2 access key has incorrect length. Cloudflare R2 access keys must be exactly 32 characters. Please check your R2_ACCESS_KEY_ID in your environment variables.';
    } else if (errorMessage.includes('InvalidArgument')) {
      errorMessage = 'Invalid storage credentials. Please verify your R2 or AWS credentials are correctly configured in your environment variables.';
    }
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Upload failed: ${error?.name || 'Error'} - ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

