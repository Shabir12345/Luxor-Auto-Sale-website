// Dynamic sitemap.xml

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.luxorautosale.com';

  // Base URLs that don't require database access
  const baseUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Try to get vehicles from database, fallback to empty array if database is not available
  let vehicleUrls: MetadataRoute.Sitemap = [];
  
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'AVAILABLE' },
      select: {
        seoSlug: true,
        updatedAt: true,
      },
    });

    vehicleUrls = vehicles.map((vehicle) => ({
      url: `${baseUrl}/vehicles/${vehicle.seoSlug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    // Database not available during build time - this is expected
    console.log('Database not available for sitemap generation during build');
  }

  return [...baseUrls, ...vehicleUrls];
}

