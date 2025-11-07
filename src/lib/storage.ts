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
// Prioritize R2 if R2_ACCOUNT_ID is set (indicates R2 usage)
const isR2Config = !!process.env.R2_ACCOUNT_ID;
const hasR2 = isR2Config && !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
const hasAws = !isR2Config && !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

// Validate R2 credentials have correct length (R2 keys are 32 chars, AWS keys are 20 chars)
let s3Client: S3Client | null = null;
if (hasR2) {
  // Get the actual values (remove any quotes that might have been included)
  const r2AccessKeyId = (process.env.R2_ACCESS_KEY_ID || '').replace(/^["']|["']$/g, '');
  const r2SecretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || '').replace(/^["']|["']$/g, '');
  const accessKeyLength = r2AccessKeyId.length;
  
  console.log('R2 Configuration:', {
    accountId: process.env.R2_ACCOUNT_ID ? 'set' : 'missing',
    accessKeyLength,
    bucket: process.env.R2_BUCKET,
    hasPublicUrl: !!process.env.R2_PUBLIC_URL,
  });
  
  if (accessKeyLength !== 32) {
    console.error(`⚠️ R2_ACCESS_KEY_ID has length ${accessKeyLength}, should be 32 characters. Cloudflare R2 access keys must be exactly 32 characters. Falling back to local filesystem storage.`);
    console.error('Current R2_ACCESS_KEY_ID value (first 10 chars):', r2AccessKeyId.substring(0, 10) + '...');
    console.error('Please verify your R2_ACCESS_KEY_ID in your environment variables. You can create new R2 API tokens in Cloudflare Dashboard > R2 > Manage R2 API Tokens.');
  } else {
    // Only create S3Client if credentials are valid
    try {
      s3Client = new S3Client({
        region: process.env.R2_REGION || 'auto',
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
        forcePathStyle: true, // required for Cloudflare R2
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      });
      console.log('✅ R2 S3Client initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize R2 client:', error?.message || error);
      s3Client = null;
    }
  }
} else if (hasAws) {
  try {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: false, // AWS S3 doesn't need path-style
    });
  } catch (error) {
    console.error('Failed to initialize AWS S3 client:', error);
    s3Client = null;
  }
}

// Prioritize R2 bucket when R2 is configured, otherwise use AWS or fallback
const BUCKET_NAME = isR2Config 
  ? (process.env.R2_BUCKET || 'luxor-auto-sale-images')
  : (process.env.AWS_S3_BUCKET || process.env.R2_BUCKET || 'luxor-auto-sale-images');

// Use R2 public URL when R2 is configured
const PUBLIC_URL = isR2Config
  ? (process.env.R2_PUBLIC_URL || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}`)
  : (process.env.R2_PUBLIC_URL || `https://${BUCKET_NAME}.s3.amazonaws.com`);

export type ImageSize = {
  width?: number;
  height?: number;
  quality?: number;
};

export const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 300, quality: 90 },
  small: { width: 800, quality: 92 },
  medium: { width: 1200, quality: 94 },
  large: { width: 1920, quality: 96 },
  original: { quality: 98 },
} satisfies Record<string, ImageSize>;

function assertStorageConfigured(): void {
  // Storage is now optional - will use local filesystem as fallback
  return;
}

/**
 * Process image with Sharp, handling EXIF orientation and format conversion
 */
async function processImageBuffer(
  buffer: Buffer,
  originalFilename: string,
  sizeConfig: ImageSize,
  sizeName: string
): Promise<{ buffer: Buffer; contentType: string; fileExtension: string }> {
  const safeFilename = sanitizeFilename(originalFilename);
  const ext = safeFilename.split('.').pop()?.toLowerCase() || 'jpg';
  const isHeic = ext === 'heic' || ext === 'heif';
  
  try {
    // Create Sharp instance and auto-rotate based on EXIF
    let processedImage = sharp(buffer, {
      failOnError: false, // Don't fail on unsupported formats, we'll catch it
    }).rotate(); // Auto-rotate based on EXIF orientation
    
    // For HEIC/HEIF, convert to JPEG first (Sharp may or may not support it)
    if (isHeic) {
      try {
        // Try to convert HEIC to JPEG
        processedImage = processedImage.jpeg({ quality: 95 });
      } catch (heicError: any) {
        throw new Error(
          'HEIC/HEIF format is not supported. Please convert your image to JPEG or PNG before uploading. ' +
          'Most phones allow you to change the format in camera settings.'
        );
      }
    }
    
    // Resize if needed
    if (sizeConfig.width) {
      processedImage = processedImage.resize(sizeConfig.width, sizeConfig.height, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      });
    }
    
    let processedBuffer: Buffer;
    let contentType: string;
    let fileExtension: string;
    
    if (sizeName === 'thumbnail') {
      // Use WebP for thumbnails
      processedBuffer = await processedImage
        .webp({ quality: sizeConfig.quality || 90, effort: 6 })
        .toBuffer();
      contentType = 'image/webp';
      fileExtension = 'webp';
    } else if (sizeName === 'original' && !isHeic && (ext === 'png')) {
      // Keep PNG format for original if it was PNG
      processedBuffer = await processedImage.png({ 
        quality: sizeConfig.quality || 98,
        compressionLevel: 6
      }).toBuffer();
      contentType = 'image/png';
      fileExtension = 'png';
    } else {
      // Convert to JPEG for everything else (including HEIC conversions)
      processedBuffer = await processedImage.jpeg({ 
        quality: sizeConfig.quality || 98,
        progressive: true,
        mozjpeg: true
      }).toBuffer();
      contentType = 'image/jpeg';
      fileExtension = 'jpg';
    }
    
    return { buffer: processedBuffer, contentType, fileExtension };
  } catch (error: any) {
    // Provide helpful error messages
    if (error.message?.includes('HEIC') || error.message?.includes('HEIF')) {
      throw error; // Re-throw our custom HEIC error
    }
    if (error.message?.includes('unsupported image format') || error.message?.includes('Input buffer')) {
      throw new Error(
        `Unsupported image format. Please use JPEG, PNG, or WebP. ` +
        `Received: ${safeFilename}. If this is a HEIC file from an iPhone, ` +
        `please convert it to JPEG first (Settings > Camera > Formats > Most Compatible).`
      );
    }
    throw new Error(`Failed to process image: ${error.message || 'Unknown error'}`);
  }
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
      const { buffer: processedBuffer, fileExtension } = await processImageBuffer(
        buffer,
        originalFilename,
        sizeConfig,
        sizeName
      );
      
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
      const { buffer: processedBuffer, contentType, fileExtension } = await processImageBuffer(
        buffer,
        originalFilename,
        sizeConfig,
        sizeName
      );
      
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
 * Sanitize filename to prevent path traversal and other security issues
 */
function sanitizeFilename(filename: string): string {
  // Remove path components and keep only the filename
  const basename = filename.split(/[/\\]/).pop() || filename;
  // Remove any characters that could be problematic
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/jfif',
    'image/png',
    'image/x-png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
  ];
  const allowedExtensions = ['.jpg', '.jpeg', '.jfif', '.png', '.webp', '.heic', '.heif'];
  const maxSize = 20 * 1024 * 1024; // 20MB
  const minSize = 100; // 100 bytes minimum

  // Sanitize filename
  const sanitizedName = sanitizeFilename(file.name);
  if (sanitizedName !== file.name) {
    console.warn(`Filename sanitized: "${file.name}" -> "${sanitizedName}"`);
  }

  // Get file extension from name (more reliable on mobile)
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
  // Check MIME type (may be empty or different on some mobile devices)
  const mimeType = file.type?.toLowerCase() || '';
  const hasValidMimeType = !file.type || allowedTypes.includes(mimeType);
  
  // Accept file if either extension or MIME type is valid
  // This handles cases where mobile devices don't set MIME type correctly
  if (!hasValidExtension && !hasValidMimeType) {
    return {
      valid: false,
      error: `Invalid file type. Only JPEG, PNG, and WebP are allowed. ` +
             `Detected: ${file.type || 'unknown'} (${file.name}). ` +
             `If this is a HEIC file from an iPhone, please convert it to JPEG first.`,
    };
  }

  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large: ${sizeMB}MB. Maximum size is 20MB.`,
    };
  }

  if (file.size < minSize) {
    return {
      valid: false,
      error: 'File appears to be empty or corrupted.',
    };
  }

  return { valid: true };
}

