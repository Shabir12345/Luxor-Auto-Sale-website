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
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Ensure baseUrl has protocol
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
    
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

          {/* Header Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 mb-8 border border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                  {vehicle.title}
                </h1>
                <div className="flex items-center gap-4 flex-wrap mb-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                    {formatPrice(vehicle.priceCents)}
                  </div>
                </div>
                <p className="text-gray-400 text-lg">
                  {formatMileage(vehicle.odometerKm)} • {vehicle.year} • {vehicle.transmission || 'Automatic'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image Gallery (Full Width on Mobile, 2/3 on Desktop) */}
            <div className="lg:col-span-2 space-y-6">
              <VehicleImageGallery 
                photos={vehicle.photos || []} 
                vehicleTitle={vehicle.title}
              />
              
              {/* Description - Below Gallery */}
              {vehicle.description && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Vehicle Description
                  </h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">{vehicle.description}</p>
                </div>
              )}
            </div>

            {/* Right Column - Details & CTA (Full Width on Mobile, 1/3 on Desktop) */}
            <div className="space-y-6">

              {/* CTA Section - Sticky at Top */}
              <div className="bg-gradient-to-br from-blue-600/20 via-green-600/20 to-blue-600/20 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-sm">
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Interested in this vehicle?</h2>
                    <p className="text-gray-300 text-sm mb-4">
                      Get in touch with us today to schedule a viewing!
                    </p>
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <a
                      href="/#contact"
                      className="btn-modern text-base px-6 py-3 w-full"
                    >
                      📅 Book a Viewing
                    </a>
                    <a
                      href="tel:+14165235375"
                      className="btn-outline-modern text-base px-6 py-3 w-full"
                    >
                      📞 Call Us Now
                    </a>
                    {vehicle.carfaxUrl && (
                      <a
                        href={vehicle.carfaxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline-modern text-base px-6 py-3 w-full bg-purple-600/10 border-purple-500/50 hover:bg-purple-600/20 text-purple-400"
                      >
                        📋 View Carfax Report
                      </a>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Quick Contact:</p>
                    <p className="text-sm text-white font-semibold">📞 (416) 523-5375</p>
                    <p className="text-sm text-white">📧 luxorautosale@gmail.com</p>
                  </div>
                </div>
              </div>

              {/* Key Specs */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Specifications
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-400 text-sm">Year</span>
                    <span className="text-white font-semibold">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <span className="text-gray-400 text-sm">Mileage</span>
                    <span className="text-white font-semibold">{formatMileage(vehicle.odometerKm)}</span>
                  </div>
                  {vehicle.bodyType && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Body Type</span>
                      <span className="text-white font-semibold">{formatBodyType(vehicle.bodyType)}</span>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Transmission</span>
                      <span className="text-white font-semibold">{formatTransmission(vehicle.transmission)}</span>
                    </div>
                  )}
                  {vehicle.drivetrain && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Drivetrain</span>
                      <span className="text-white font-semibold">{formatDrivetrain(vehicle.drivetrain)}</span>
                    </div>
                  )}
                  {vehicle.fuelType && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Fuel Type</span>
                      <span className="text-white font-semibold">{formatFuelType(vehicle.fuelType)}</span>
                    </div>
                  )}
                  {vehicle.engine && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Engine</span>
                      <span className="text-white font-semibold">{vehicle.engine}</span>
                    </div>
                  )}
                  {vehicle.exteriorColor && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 text-sm">Exterior</span>
                      <span className="text-white font-semibold">{vehicle.exteriorColor}</span>
                    </div>
                  )}
                  {vehicle.interiorColor && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-400 text-sm">Interior</span>
                      <span className="text-white font-semibold">{vehicle.interiorColor}</span>
                    </div>
                  )}
                </div>
              </div>



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

            </div>
          </div>

          {/* Features - Below Main Content */}
          {vehicle.features && vehicle.features.length > 0 && (
            <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Features & Options
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {vehicle.features.map((feature: any) => (
                  <div key={feature.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-gray-300">{feature.feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

