// Image Storage Utility (S3 or Cloudflare R2)

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';

// Debug logging for environment variables (safe - only logs what's set, not values)
console.log('Storage configuration check:', {
  hasR2Account: !!process.env.R2_ACCOUNT_ID,
  hasR2AccessKey: !!process.env.R2_ACCESS_KEY_ID,
  r2AccessKeyLength: process.env.R2_ACCESS_KEY_ID?.length || 0,
  hasR2Secret: !!process.env.R2_SECRET_ACCESS_KEY,
  r2SecretLength: process.env.R2_SECRET_ACCESS_KEY?.length || 0,
  hasR2Bucket: !!process.env.R2_BUCKET,
  hasR2PublicUrl: !!process.env.R2_PUBLIC_URL,
  hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  awsAccessKeyLength: process.env.AWS_ACCESS_KEY_ID?.length || 0,
  hasAwsSecret: !!process.env.AWS_SECRET_ACCESS_KEY,
  hasAwsBucket: !!process.env.AWS_S3_BUCKET,
  hasAwsRegion: !!process.env.AWS_REGION,
});

// S3 Client Configuration (works with both AWS S3 and Cloudflare R2)
// Only initialize if credentials are provided
const hasR2 = !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
const hasAws = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

const s3Client = (hasR2 || hasAws) ? new S3Client({
  region: process.env.AWS_REGION || process.env.R2_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true, // required for Cloudflare R2
  ...(process.env.R2_ACCOUNT_ID && {
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  }),
}) : null;

const BUCKET_NAME = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || 'luxor-auto-sale-images';
const PUBLIC_URL =
  process.env.R2_PUBLIC_URL ||
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}`
    : `https://${BUCKET_NAME}.s3.amazonaws.com`);

export type ImageSize = {
  width: number;
  height?: number;
  quality?: number;
};

export const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 300, quality: 90 },
  small: { width: 800, quality: 92 },
  medium: { width: 1200, quality: 94 },
  large: { width: 1920, quality: 96 },
  original: { quality: 98 },
};

function assertStorageConfigured(): void {
  // Storage is now optional - will use local filesystem as fallback
  return;
}

/**
 * Upload image locally (fallback when S3/R2 not configured)
 */
async function uploadToLocalFilesystem(
  buffer: Buffer,
  vehicleId: string,
  originalFilename: string
): Promise<{ urls: Record<string, string>; primaryUrl: string }> {
  const fileId = nanoid(10);
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const basePath = `vehicles/${vehicleId}/${fileId}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'vehicles', vehicleId);
  
  // Create directory if it doesn't exist
  await mkdir(uploadDir, { recursive: true });

  const urls: Record<string, string> = {};

  // Only upload thumbnail and large sizes for local storage (to save space)
  const sizesToProcess = ['thumbnail', 'large'];
  
  for (const sizeName of sizesToProcess) {
    const sizeConfig = IMAGE_SIZES[sizeName as keyof typeof IMAGE_SIZES];
    try {
      let processedImage = sharp(buffer);
      if ('width' in sizeConfig && sizeConfig.width) {
        processedImage = processedImage.resize(sizeConfig.width, 'height' in sizeConfig ? sizeConfig.height : undefined, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        });
      }
      
      let processedBuffer: Buffer;
      let fileExtension: string;
      
      if (sizeName === 'thumbnail') {
        // Use WebP for thumbnails
        processedBuffer = await processedImage
          .webp({ quality: sizeConfig.quality || 90, effort: 6 })
          .toBuffer();
        fileExtension = 'webp';
      } else {
        // Keep original format for large size
        if (ext === 'png') {
          processedBuffer = await processedImage.png({ 
            quality: sizeConfig.quality || 98,
            compressionLevel: 6
          }).toBuffer();
          fileExtension = 'png';
        } else {
          processedBuffer = await processedImage.jpeg({ 
            quality: sizeConfig.quality || 98,
            progressive: true,
            mozjpeg: true
          }).toBuffer();
          fileExtension = 'jpg';
        }
      }
      
      const fileName = `${fileId}-${sizeName}.${fileExtension}`;
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, processedBuffer);
      
      // Return relative URL
      urls[sizeName] = `/uploads/vehicles/${vehicleId}/${fileName}`;
    } catch (err: any) {
      console.error('Local file upload error:', err?.name, err?.message);
      throw err;
    }
  }

  return {
    urls,
    primaryUrl: urls.large || urls.thumbnail,
  };
}

/**
 * Upload image to S3/R2 with multiple sizes
 */
export async function uploadVehicleImage(
  buffer: Buffer,
  vehicleId: string,
  originalFilename: string
): Promise<{ urls: Record<string, string>; primaryUrl: string }> {
  assertStorageConfigured();
  
  // Use local filesystem if S3/R2 is not configured
  if (!s3Client) {
    console.log('S3/R2 not configured, using local filesystem');
    return uploadToLocalFilesystem(buffer, vehicleId, originalFilename);
  }
  
  const fileId = nanoid(10);
  const ext = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const basePath = `vehicles/${vehicleId}/${fileId}`;

  const urls: Record<string, string> = {};

  // Process and upload each size
  for (const [sizeName, sizeConfig] of Object.entries(IMAGE_SIZES)) {
    try {
      let processedImage = sharp(buffer);
      if ('width' in sizeConfig && sizeConfig.width) {
        processedImage = processedImage.resize(sizeConfig.width, 'height' in sizeConfig ? sizeConfig.height : undefined, {
          fit: 'inside',
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3, // Better resampling algorithm
        });
      }
      
      // For original size, preserve the original format if it's JPEG/PNG
      let processedBuffer: Buffer;
      let contentType: string;
      let fileExtension: string;
      
      if (sizeName === 'original' && (ext === 'jpg' || ext === 'jpeg' || ext === 'png')) {
        // Keep original format for highest quality
        if (ext === 'png') {
          processedBuffer = await processedImage.png({ 
            quality: sizeConfig.quality || 98,
            compressionLevel: 6
          }).toBuffer();
          contentType = 'image/png';
          fileExtension = 'png';
        } else {
          processedBuffer = await processedImage.jpeg({ 
            quality: sizeConfig.quality || 98,
            progressive: true,
            mozjpeg: true
          }).toBuffer();
          contentType = 'image/jpeg';
          fileExtension = 'jpg';
        }
      } else {
        // Use WebP for all other sizes
        processedBuffer = await processedImage
          .webp({ 
            quality: sizeConfig.quality || 90,
            effort: 6, // Higher effort for better compression
            lossless: false,
            nearLossless: false
          })
          .toBuffer();
        contentType = 'image/webp';
        fileExtension = 'webp';
      }
      
      const key = `${basePath}-${sizeName}.${fileExtension}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: processedBuffer,
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000',
        })
      );
      urls[sizeName] = `${PUBLIC_URL}/${key}`;
    } catch (err: any) {
      console.error('S3/R2 upload error:', err?.name, err?.message);
      throw err;
    }
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
    // Check if it's a local file or S3/R2 URL
    if (imageUrl.startsWith('/uploads/')) {
      // Local file
      const filePath = join(process.cwd(), 'public', imageUrl.replace(/^\//, ''));
      try {
        await unlink(filePath);
      } catch (error) {
        // Ignore errors for files that don't exist
      }
      return;
    }

    // S3/R2 file
    if (!s3Client) {
      console.log('S3/R2 not configured, skipping delete');
      return;
    }

    // Extract key from URL
    const key = imageUrl.replace(PUBLIC_URL + '/', '');
    const basePath = key.replace(/-[^-]+\.(webp|jpg|jpeg|png)$/, '');

    // Delete all sizes
    for (const sizeName of Object.keys(IMAGE_SIZES)) {
      // Try both .webp and original format extensions
      const extensions = ['webp', 'jpg', 'jpeg', 'png'];
      for (const ext of extensions) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: `${basePath}-${sizeName}.${ext}`,
            })
          );
        } catch (error) {
          // Ignore errors for files that don't exist
        }
      }
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
  const maxSize = 20 * 1024 * 1024; // 20MB (increased for higher quality)

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 20MB.',
    };
  }

  return { valid: true };
}

