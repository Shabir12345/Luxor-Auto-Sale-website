// Vehicle Detail Page

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, formatMileage, formatBodyType, formatDrivetrain, formatFuelType, formatTransmission } from '@/utils/formatters';
import VehicleImageGallery from '@/components/VehicleImageGallery';

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
        <header className="bg-gray-800/90 backdrop-blur-sm border-b border-blue-500/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center nav-mobile" style={{height: '76px'}}>
              <Link href="/" className="flex items-center">
                <img 
                  src="/Logo.png" 
                  alt="Luxor Auto Sale Logo" 
                  className="logo transition-all duration-300"
                />
              </Link>
              <nav className="flex gap-6">
                <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Home
                </Link>
                <Link href="/inventory" className="text-gray-300 hover:text-blue-400 transition-colors">
                  Inventory
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-8">
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/inventory" className="hover:text-blue-400 transition-colors">Inventory</Link>
            <span>›</span>
            <span className="text-white">{vehicle.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-6">
              <VehicleImageGallery 
                photos={vehicle.photos || []} 
                vehicleTitle={vehicle.title}
              />
            </div>

            {/* Vehicle Details */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {vehicle.title}
                  </h1>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    vehicle.status === 'AVAILABLE' ? 'bg-green-500 text-white' :
                    vehicle.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                    vehicle.status === 'SOLD' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {vehicle.status === 'AVAILABLE' ? '✅ Available' :
                     vehicle.status === 'PENDING' ? '⏳ Pending Sale' :
                     vehicle.status === 'SOLD' ? '✅ Sold' :
                     vehicle.status}
                  </div>
                </div>
                
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  {formatPrice(vehicle.priceCents)}
                </div>
              </div>

              {/* Key Specs */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Key Specifications
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">Year</div>
                    <div className="text-white font-semibold text-lg">{vehicle.year}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-400 text-sm">Mileage</div>
                    <div className="text-white font-semibold text-lg">{formatMileage(vehicle.odometerKm)}</div>
                  </div>
                  {vehicle.bodyType && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Body Type</div>
                      <div className="text-white font-semibold text-lg">{formatBodyType(vehicle.bodyType)}</div>
                    </div>
                  )}
                  {vehicle.drivetrain && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Drivetrain</div>
                      <div className="text-white font-semibold text-lg">{formatDrivetrain(vehicle.drivetrain)}</div>
                    </div>
                  )}
                  {vehicle.fuelType && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Fuel Type</div>
                      <div className="text-white font-semibold text-lg">{formatFuelType(vehicle.fuelType)}</div>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Transmission</div>
                      <div className="text-white font-semibold text-lg">{formatTransmission(vehicle.transmission)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Additional Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vehicle.engine && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Engine</div>
                      <div className="text-white font-medium">{vehicle.engine}</div>
                    </div>
                  )}
                  {vehicle.exteriorColor && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Exterior Color</div>
                      <div className="text-white font-medium">{vehicle.exteriorColor}</div>
                    </div>
                  )}
                  {vehicle.interiorColor && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Interior Color</div>
                      <div className="text-white font-medium">{vehicle.interiorColor}</div>
                    </div>
                  )}
                  {vehicle.stockNumber && (
                    <div className="space-y-1">
                      <div className="text-gray-400 text-sm">Stock #</div>
                      <div className="text-white font-medium">{vehicle.stockNumber}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
                </div>
              )}

              {/* Features */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Features & Options
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicle.features.map((feature: any) => (
                      <div key={feature.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-green-500 text-lg">✓</span>
                        <span className="text-gray-300">{feature.feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Section */}
              <div className="bg-gradient-to-br from-blue-600/20 to-green-600/20 rounded-2xl p-8 border border-blue-500/30">
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Interested in this vehicle?</h2>
                    <p className="text-gray-300 text-lg">
                      Contact us today to schedule a viewing or learn more about this vehicle.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="/#contact"
                      className="btn-modern text-lg px-8 py-4"
                    >
                      Book a Viewing
                    </a>
                    <a
                      href="tel:+1234567890"
                      className="btn-outline-modern text-lg px-8 py-4"
                    >
                      Call Now
                    </a>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>📞 Call us at (123) 456-7890</p>
                    <p>📧 Email us at info@luxorautosale.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

