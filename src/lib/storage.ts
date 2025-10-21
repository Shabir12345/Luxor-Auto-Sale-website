// Image Storage Utility (S3 or Cloudflare R2)

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import sharp from 'sharp';

// S3 Client Configuration (works with both AWS S3 and Cloudflare R2)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '',
  },
  // For Cloudflare R2, set custom endpoint
  ...(process.env.R2_ACCOUNT_ID && {
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  }),
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || 'luxor-auto-sale';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`;

export type ImageSize = {
  width: number;
  height?: number;
  quality?: number;
};

export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 200, quality: 80 },
  small: { width: 640, quality: 85 },
  medium: { width: 1024, quality: 85 },
  large: { width: 1920, quality: 90 },
  original: { quality: 95 },
};

/**
 * Upload image to S3/R2 with multiple sizes
 */
export async function uploadVehicleImage(
  buffer: Buffer,
  vehicleId: string,
  originalFilename: string
): Promise<{ urls: Record<string, string>; primaryUrl: string }> {
  const fileId = nanoid(10);
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const basePath = `vehicles/${vehicleId}/${fileId}`;

  const urls: Record<string, string> = {};

  // Process and upload each size
  for (const [sizeName, sizeConfig] of Object.entries(IMAGE_SIZES)) {
    let processedImage = sharp(buffer);

    // Resize if dimensions specified
    if (sizeConfig.width) {
      processedImage = processedImage.resize(sizeConfig.width, sizeConfig.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to WebP with quality setting
    const webpBuffer = await processedImage
      .webp({ quality: sizeConfig.quality || 85 })
      .toBuffer();

    const key = `${basePath}-${sizeName}.webp`;

    // Upload to S3/R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000', // 1 year
      })
    );

    urls[sizeName] = `${PUBLIC_URL}/${key}`;
  }

  return {
    urls,
    primaryUrl: urls.large,
  };
}

/**
 * Delete all versions of an image
 */
export async function deleteVehicleImage(imageUrl: string): Promise<void> {
  try {
    // Extract key from URL
    const key = imageUrl.replace(PUBLIC_URL + '/', '');
    const basePath = key.replace(/-[^-]+\.webp$/, '');

    // Delete all sizes
    for (const sizeName of Object.keys(IMAGE_SIZES)) {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `${basePath}-${sizeName}.webp`,
        })
      );
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

