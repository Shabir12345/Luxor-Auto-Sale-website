'use client';

// Public Inventory Page

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Select from '@/components/Select';
import { formatPrice, formatMileage, getStatusBadgeStyle } from '@/utils/formatters';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function InventoryPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
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
    sortBy: 'newest',
  });

  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch unique makes from API on mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await fetch('/api/vehicles/makes');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailableMakes(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch makes:', error);
      }
    };
    fetchMakes();
  }, []);

  // Fetch vehicles when filters change
  useEffect(() => {
    fetchVehicles();
  }, [debouncedSearch, filters.make, filters.model, filters.year, filters.minPrice, filters.maxPrice, filters.maxMileage, filters.transmission, filters.fuelType, filters.bodyType, filters.sortBy]);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.make && { make: filters.make }),
        ...(filters.model && { model: filters.model }),
        ...(filters.year && { year: filters.year }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.maxMileage && { maxMileage: filters.maxMileage }),
        ...(filters.transmission && { transmission: filters.transmission }),
        ...(filters.fuelType && { fuelType: filters.fuelType }),
        ...(filters.bodyType && { bodyType: filters.bodyType }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
      });
      params.set('perPage', '100');

      const response = await fetch(`/api/vehicles?${params}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.data);
        setTotalVehicles(data.data.pagination?.total ?? data.data.data.length ?? 0);
        
        // Extract unique models for dropdown (case-insensitive)
        const rawModels = data.data.data.map((v: any) => v.model).filter(Boolean);
        const uniqueModelMap = new Map<string, string>();
        rawModels.forEach((model: string) => {
          const normalized = model.trim().toLowerCase();
          if (!uniqueModelMap.has(normalized)) {
            uniqueModelMap.set(normalized, model.trim());
          }
        });
        const models = Array.from(uniqueModelMap.values()).sort((a, b) => 
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        );
        setAvailableModels(models);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.make, filters.model, filters.year, filters.minPrice, filters.maxPrice, filters.maxMileage, filters.transmission, filters.fuelType, filters.bodyType, filters.sortBy]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const clearFilters = useCallback(() => {
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
      sortBy: 'newest',
    });
  }, []);

  const getFilterCount = useMemo(() => {
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
    return count;
  }, [filters]);

  // Memoize options to prevent re-renders
  const makeOptions = useMemo(() => 
    availableMakes.map(make => ({ value: make, label: make })),
    [availableMakes]
  );

  const modelOptions = useMemo(() => 
    availableModels.map(model => ({ value: model, label: model })),
    [availableModels]
  );

  const sortOptions = useMemo(() => [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'mileage-low', label: 'Mileage: Low to High' },
    { value: 'mileage-high', label: 'Mileage: High to Low' },
  ], []);

  const transmissionOptions = useMemo(() => [
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
    { value: 'CVT', label: 'CVT' },
  ], []);

  const fuelTypeOptions = useMemo(() => [
    { value: 'Gasoline', label: 'Gasoline' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Electric', label: 'Electric' },
  ], []);

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
                className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Select
              value={filters.make}
              onChange={(value) => handleSelectChange('make', value)}
              options={makeOptions}
              placeholder="All Makes"
            />

            <Select
              value={filters.model}
              onChange={(value) => handleSelectChange('model', value)}
              options={modelOptions}
              placeholder="All Models"
            />

            <Select
              value={filters.sortBy}
              onChange={(value) => handleSelectChange('sortBy', value)}
              options={sortOptions}
              placeholder="Sort By"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
            >
              <svg className={`w-5 h-5 mr-2 transition-transform duration-200 ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Advanced Filters
              {getFilterCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {getFilterCount}
                </span>
              )}
            </button>

            {getFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 animate-in fade-in slide-in-from-top-2 duration-200">
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
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
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
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
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
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
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
                  className="w-full px-3 py-2 bg-gray-700/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Transmission</label>
                <Select
                  value={filters.transmission}
                  onChange={(value) => handleSelectChange('transmission', value)}
                  options={transmissionOptions}
                  placeholder="Any Transmission"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Fuel Type</label>
                <Select
                  value={filters.fuelType}
                  onChange={(value) => handleSelectChange('fuelType', value)}
                  options={fuelTypeOptions}
                  placeholder="Any Fuel Type"
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>
              {loading ? 'Loading...' : `${totalVehicles} vehicle${totalVehicles !== 1 ? 's' : ''} found`}
            </span>
            {getFilterCount > 0 && (
              <span className="text-blue-400">
                {getFilterCount} filter{getFilterCount !== 1 ? 's' : ''} applied
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
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                {vehicle.photos && vehicle.photos.length > 0 ? (
                  <div className="relative h-48 bg-gray-700">
                    <Image
                      src={vehicle.photos[0].url}
                      alt={vehicle.photos[0].altText || vehicle.title}
                      fill
                      className="object-cover"
                    />
                    {vehicle.status && (
                      <div className={`absolute top-4 left-4 ${getStatusBadgeStyle(vehicle.status).bgColor} ${getStatusBadgeStyle(vehicle.status).textColor} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                        {getStatusBadgeStyle(vehicle.status).label}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-4xl">🚗</span>
                    {vehicle.status && (
                      <div className={`absolute top-4 left-4 ${getStatusBadgeStyle(vehicle.status).bgColor} ${getStatusBadgeStyle(vehicle.status).textColor} px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
                        {getStatusBadgeStyle(vehicle.status).label}
                      </div>
                    )}
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
