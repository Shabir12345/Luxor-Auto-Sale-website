// Dynamic sitemap.xml

import { MetadataRoute } from 'next';

// Disable dynamic generation to avoid build-time database access
export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.luxorautosale.com';

  // Base URLs - no database access needed
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

  // Return only base URLs to avoid database access during build
  // Vehicle URLs will be added dynamically at runtime if needed
  return baseUrls;
}

