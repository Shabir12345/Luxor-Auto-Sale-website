// Vehicle Detail Page

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, formatMileage, formatBodyType, formatDrivetrain, formatFuelType, formatTransmission } from '@/utils/formatters';

type Props = {
  params: { slug: string };
};

async function getVehicle(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/vehicles/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch vehicle:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicle(params.slug);

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found',
    };
  }

  return {
    title: `${vehicle.title} - Luxor Auto Sale`,
    description: vehicle.description || `${vehicle.title} for sale at Luxor Auto Sale`,
    openGraph: {
      title: vehicle.title,
      description: vehicle.description || `${vehicle.title} for sale`,
      images: vehicle.photos?.[0]?.url ? [vehicle.photos[0].url] : [],
    },
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const vehicle = await getVehicle(params.slug);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Vehicle Not Found</h1>
          <Link href="/inventory" className="text-blue-400 hover:text-blue-300">
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  // Structured Data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: vehicle.title,
    brand: {
      '@type': 'Brand',
      name: vehicle.make,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.year,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.odometerKm,
      unitCode: 'KMT',
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.priceCents / 100,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'Luxor Auto Sale',
      },
    },
    ...(vehicle.description && { description: vehicle.description }),
    ...(vehicle.bodyType && { bodyType: formatBodyType(vehicle.bodyType) }),
    ...(vehicle.drivetrain && { driveWheelConfiguration: formatDrivetrain(vehicle.drivetrain) }),
    ...(vehicle.fuelType && { fuelType: formatFuelType(vehicle.fuelType) }),
    ...(vehicle.exteriorColor && { color: vehicle.exteriorColor }),
    ...(vehicle.photos?.[0]?.url && { image: vehicle.photos[0].url }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-white">
              Luxor Auto Sale
            </Link>
              <nav className="flex gap-6">
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
                <Link href="/inventory" className="text-gray-300 hover:text-white">
                  Inventory
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/inventory" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
            ← Back to Inventory
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <>
                  <div className="relative h-96 bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={vehicle.photos[0].url}
                      alt={vehicle.photos[0].altText || vehicle.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {vehicle.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {vehicle.photos.slice(1, 5).map((photo: any, index: number) => (
                        <div key={photo.id} className="relative h-24 bg-gray-800 rounded overflow-hidden">
                          <Image
                            src={photo.url}
                            alt={photo.altText || `${vehicle.title} - Image ${index + 2}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-96 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-6xl">🚗</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">{vehicle.title}</h1>
              <div className="text-3xl font-bold text-blue-400 mb-6">
                {formatPrice(vehicle.priceCents)}
              </div>

              {/* Specs */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Specifications</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Year</div>
                    <div className="text-white font-medium">{vehicle.year}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Mileage</div>
                    <div className="text-white font-medium">{formatMileage(vehicle.odometerKm)}</div>
                  </div>
                  {vehicle.bodyType && (
                    <div>
                      <div className="text-gray-400">Body Type</div>
                      <div className="text-white font-medium">{formatBodyType(vehicle.bodyType)}</div>
                    </div>
                  )}
                  {vehicle.drivetrain && (
                    <div>
                      <div className="text-gray-400">Drivetrain</div>
                      <div className="text-white font-medium">{formatDrivetrain(vehicle.drivetrain)}</div>
                    </div>
                  )}
                  {vehicle.fuelType && (
                    <div>
                      <div className="text-gray-400">Fuel Type</div>
                      <div className="text-white font-medium">{formatFuelType(vehicle.fuelType)}</div>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div>
                      <div className="text-gray-400">Transmission</div>
                      <div className="text-white font-medium">{formatTransmission(vehicle.transmission)}</div>
                    </div>
                  )}
                  {vehicle.engine && (
                    <div>
                      <div className="text-gray-400">Engine</div>
                      <div className="text-white font-medium">{vehicle.engine}</div>
                    </div>
                  )}
                  {vehicle.exteriorColor && (
                    <div>
                      <div className="text-gray-400">Exterior Color</div>
                      <div className="text-white font-medium">{vehicle.exteriorColor}</div>
                    </div>
                  )}
                  {vehicle.interiorColor && (
                    <div>
                      <div className="text-gray-400">Interior Color</div>
                      <div className="text-white font-medium">{vehicle.interiorColor}</div>
                    </div>
                  )}
                  {vehicle.stockNumber && (
                    <div>
                      <div className="text-gray-400">Stock #</div>
                      <div className="text-white font-medium">{vehicle.stockNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                  <p className="text-gray-300 whitespace-pre-line">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4">Features</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.features.map((feature: any) => (
                      <div key={feature.id} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-300">{feature.feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Interested?</h2>
                <p className="text-gray-300 mb-4">
                  Contact us today to schedule a viewing or learn more about this vehicle.
                </p>
                <a
                  href="/#contact"
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Book a Viewing
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

