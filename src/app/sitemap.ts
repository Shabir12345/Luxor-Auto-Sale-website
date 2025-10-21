// Dynamic sitemap.xml

import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.luxorautosale.com';

  // Get all published vehicles
  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'AVAILABLE' },
    select: {
      seoSlug: true,
      updatedAt: true,
    },
  });

  const vehicleUrls = vehicles.map((vehicle) => ({
    url: `${baseUrl}/vehicles/${vehicle.seoSlug}`,
    lastModified: vehicle.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/inventory`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...vehicleUrls,
  ];
}

