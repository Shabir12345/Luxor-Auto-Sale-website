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
    model: '',
    year: '',
    minPrice: '',
    maxPrice: '',
    maxMileage: '',
    transmission: '',
    fuelType: '',
    bodyType: '',
    status: 'ALL',
    sortBy: 'newest',
  });

  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.make && { make: filters.make }),
        ...(filters.model && { model: filters.model }),
        ...(filters.year && { year: filters.year }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.maxMileage && { maxMileage: filters.maxMileage }),
        ...(filters.transmission && { transmission: filters.transmission }),
        ...(filters.fuelType && { fuelType: filters.fuelType }),
        ...(filters.bodyType && { bodyType: filters.bodyType }),
        ...(filters.status !== 'ALL' && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
      });

      const response = await fetch(`/api/vehicles?${params}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.data);
        
        // Extract unique makes and models for dropdowns
        const makes = [...new Set(data.data.data.map((v: any) => v.make).filter(Boolean))].sort() as string[];
        const models = [...new Set(data.data.data.map((v: any) => v.model).filter(Boolean))].sort() as string[];

        setAvailableMakes(makes);
        setAvailableModels(models);
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

  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      year: '',
      minPrice: '',
      maxPrice: '',
      maxMileage: '',
      transmission: '',
      fuelType: '',
      bodyType: '',
      status: 'ALL',
      sortBy: 'newest',
    });
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.make) count++;
    if (filters.model) count++;
    if (filters.year) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.maxMileage) count++;
    if (filters.transmission) count++;
    if (filters.fuelType) count++;
    if (filters.bodyType) count++;
    if (filters.status !== 'ALL') count++;
    return count;
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

        {/* Advanced Search & Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-blue-500/20">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by make, model, year, or any keyword..."
                className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <select
              name="make"
              value={filters.make}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            >
              <option value="">All Makes</option>
              {availableMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            <select
              name="model"
              value={filters.model}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            >
              <option value="">All Models</option>
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="PENDING">Pending</option>
              <option value="SOLD">Sold</option>
            </select>

            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="px-4 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="mileage-low">Mileage: Low to High</option>
              <option value="mileage-high">Mileage: High to Low</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              <svg className={`w-5 h-5 mr-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Advanced Filters
              {getFilterCount() > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getFilterCount()}
                </span>
              )}
            </button>

            {getFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Year</label>
                <input
                  type="number"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  placeholder="e.g., 2020"
                  min="1990"
                  max="2024"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Min Price</label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="e.g., 10000"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Max Price</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="e.g., 50000"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Max Mileage</label>
                <input
                  type="number"
                  name="maxMileage"
                  value={filters.maxMileage}
                  onChange={handleFilterChange}
                  placeholder="e.g., 100000"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  <option value="">Any Transmission</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  <option value="">Any Fuel Type</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>
              {loading ? 'Loading...' : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} found`}
            </span>
            {getFilterCount() > 0 && (
              <span className="text-blue-400">
                {getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} applied
              </span>
            )}
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

