'use client';

// Public Inventory Page

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatMileage } from '@/utils/formatters';

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    make: '',
    minPrice: '',
    maxPrice: '',
    maxMileage: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams({
        // Remove status filter to show all vehicles (available, pending, sold)
        ...(filters.search && { search: filters.search }),
        ...(filters.make && { make: filters.make }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.maxMileage && { maxMileage: filters.maxMileage }),
      });

      const response = await fetch(`/api/vehicles?${params}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center nav-mobile" style={{height: '104px'}}>
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
              <Link href="/inventory" className="text-blue-400 font-semibold">
                Inventory
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-8">Our Inventory</h1>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-500/20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
            <input
              type="text"
              name="make"
              value={filters.make}
              onChange={handleFilterChange}
              placeholder="Make (e.g., Honda)"
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="Min Price"
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="Max Price"
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
            <input
              type="number"
              name="maxMileage"
              value={filters.maxMileage}
              onChange={handleFilterChange}
              placeholder="Max Mileage (km)"
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            />
          </div>
        </div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="text-white text-center py-12">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center text-gray-400 border border-gray-700">
            No vehicles found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/vehicles/${vehicle.seoSlug}`}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all transform hover:scale-105"
              >
                {vehicle.photos && vehicle.photos.length > 0 ? (
                  <div className="relative h-48 bg-gray-700">
                    <Image
                      src={vehicle.photos[0].url}
                      alt={vehicle.photos[0].altText || vehicle.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                      vehicle.status === 'AVAILABLE' ? 'bg-green-600 text-white' :
                      vehicle.status === 'PENDING' ? 'bg-yellow-600 text-white' :
                      vehicle.status === 'SOLD' ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {vehicle.status === 'AVAILABLE' ? '✅ Available' :
                       vehicle.status === 'PENDING' ? '⏳ Pending Sale' :
                       vehicle.status === 'SOLD' ? '✅ Sold' :
                       vehicle.status}
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-4xl">🚗</span>
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-bold ${
                      vehicle.status === 'AVAILABLE' ? 'bg-green-600 text-white' :
                      vehicle.status === 'PENDING' ? 'bg-yellow-600 text-white' :
                      vehicle.status === 'SOLD' ? 'bg-blue-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {vehicle.status === 'AVAILABLE' ? '✅ Available' :
                       vehicle.status === 'PENDING' ? '⏳ Pending Sale' :
                       vehicle.status === 'SOLD' ? '✅ Sold' :
                       vehicle.status}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{vehicle.title}</h3>
                  <div className="space-y-1 text-gray-400 text-sm mb-4">
                    <div>
                      {vehicle.year} • {formatMileage(vehicle.odometerKm)}
                    </div>
                    {vehicle.exteriorColor && <div>Color: {vehicle.exteriorColor}</div>}
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatPrice(vehicle.priceCents)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

