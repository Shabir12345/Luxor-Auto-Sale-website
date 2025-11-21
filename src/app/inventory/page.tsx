'use client';

// Public Inventory Page - Modern Revamp with Mobile Improvements

// Force dynamic rendering to prevent build-time errors
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, formatMileage, getStatusBadgeStyle } from '@/utils/formatters';
import { useVehicleFilters } from '@/hooks/useVehicleFilters';
import FilterSidebar from '@/components/inventory/FilterSidebar';
import Select from '@/components/Select';

function InventoryContent() {
  const { filters, setFilter, clearFilters, isInitialized, activeFilterCount } = useVehicleFilters();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFiltersOpen) {
        setIsMobileFiltersOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileFiltersOpen]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFiltersOpen]);

  // Fetch unique makes from API on mount
  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await fetch(`/api/vehicles/makes?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const uniqueMakes: string[] = Array.from(new Set(
            (data.data as string[]).map((m: string) => m.trim())
          )).sort();
          setAvailableMakes(uniqueMakes);
        }
      } catch (error) {
        console.error('Failed to fetch makes:', error);
      }
    };
    fetchMakes();
  }, []);

  // Fetch models when make changes
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.make) {
          params.set('make', filters.make);
        }
        
        const response = await fetch(`/api/vehicles/models?${params.toString()}`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setAvailableModels(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
      }
    };
    
    fetchModels();
  }, [filters.make]);

  // Fetch vehicles when filters change
  const fetchVehicles = useCallback(async () => {
    if (!isInitialized) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.set('perPage', '100');

      const response = await fetch(`/api/vehicles?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data.data);
        setTotalVehicles(data.data.pagination?.total ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, isInitialized]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/95 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-40 shadow-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 lg:h-[104px]">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/Logo.png" 
                alt="Luxor Auto Sale Logo" 
                width={150}
                height={60}
                className="h-12 lg:h-14 w-auto transition-all duration-300 group-hover:scale-105"
                priority
              />
            </Link>
            <nav className="hidden md:flex gap-8 items-center">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-blue-400 transition-all duration-300 font-semibold text-base relative group"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/inventory" 
                className="text-blue-400 font-bold text-base relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-400 after:shadow-lg after:shadow-blue-400/50"
              >
                Inventory
              </Link>
            </nav>
            {/* Mobile Menu Button */}
            <Link href="/" className="md:hidden text-gray-300 hover:text-blue-400 transition-colors font-semibold text-sm">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter & Sort Button */}
          <div className="lg:hidden flex gap-3 mb-4">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filters & Sort
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Filter Drawer Overlay */}
          {isMobileFiltersOpen && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden animate-in fade-in duration-300"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
          )}

          {/* Mobile Filter Drawer */}
          <div className={`fixed inset-y-0 left-0 w-[90vw] max-w-md bg-gray-900 z-50 lg:hidden transform transition-transform duration-300 ease-out shadow-2xl ${
            isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="h-full flex flex-col overflow-hidden">
              {/* Mobile Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Filters & Sort
                </h2>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Drawer Content */}
              <div className="flex-1 overflow-y-auto pb-24">
                <div className="p-4">
                  {/* Sort First on Mobile */}
                  <div className="mb-6 pb-6 border-b border-gray-700">
                    <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onChange={(val) => setFilter('sortBy', val)}
                      options={[
                        { value: 'newest', label: 'Newest First' },
                        { value: 'oldest', label: 'Oldest First' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'mileage-low', label: 'Mileage: Low to High' },
                        { value: 'mileage-high', label: 'Mileage: High to Low' },
                      ]}
                      placeholder="Sort By"
                    />
                  </div>

                  {/* Filters - Mobile Version */}
                  <FilterSidebar
                    filters={filters}
                    setFilter={setFilter}
                    clearFilters={clearFilters}
                    availableMakes={availableMakes}
                    availableModels={availableModels}
                    hideHeader={true}
                  />
                </div>
              </div>

              {/* Mobile Drawer Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700 flex gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-28">
              <FilterSidebar
                filters={filters}
                setFilter={setFilter}
                clearFilters={clearFilters}
                availableMakes={availableMakes}
                availableModels={availableModels}
              />
            </div>
          </aside>

          {/* Results Area */}
          <div className="w-full lg:w-3/4">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4 bg-gradient-to-br from-gray-800/60 to-gray-800/40 backdrop-blur-md p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-gray-700/50 shadow-xl">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-green-400 bg-clip-text text-transparent">
                  Our Inventory
                </h1>
                <p className="text-gray-400 text-sm lg:text-base font-medium">
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></span>
                      Loading...
                    </span>
                  ) : (
                    `Found ${totalVehicles} vehicle${totalVehicles !== 1 ? 's' : ''}`
                  )}
                </p>
              </div>
              
              {/* Desktop Sort Only */}
              <div className="hidden lg:block w-56">
                <Select
                  value={filters.sortBy}
                  onChange={(val) => setFilter('sortBy', val)}
                  options={[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'oldest', label: 'Oldest First' },
                    { value: 'price-low', label: 'Price: Low to High' },
                    { value: 'price-high', label: 'Price: High to Low' },
                    { value: 'mileage-low', label: 'Mileage: Low to High' },
                    { value: 'mileage-high', label: 'Mileage: High to Low' },
                  ]}
                  placeholder="Sort By"
                />
              </div>
            </div>

            {/* Vehicle Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-800/50 rounded-xl lg:rounded-2xl h-[450px] lg:h-[500px] border border-gray-700/50"></div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-16 lg:py-20 bg-gradient-to-br from-gray-800/50 to-gray-800/30 rounded-xl lg:rounded-2xl border border-gray-700/50 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="text-6xl lg:text-7xl mb-6 animate-bounce">🔍</div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">No vehicles found</h3>
                <p className="text-gray-400 mb-8 text-base lg:text-lg px-4">Try adjusting your filters to see more results.</p>
                <button
                  onClick={() => {
                    clearFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="px-6 lg:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {vehicles.map((vehicle, index) => (
                  <Link
                    key={vehicle.id}
                    href={`/vehicles/${vehicle.seoSlug}`}
                    className="group bg-gradient-to-br from-gray-800/90 to-gray-800/70 rounded-xl lg:rounded-2xl overflow-hidden border border-gray-700/50 hover:border-blue-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col transform hover:-translate-y-1 lg:hover:-translate-y-2"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                      {vehicle.photos && vehicle.photos.length > 0 ? (
                        <Image
                          src={vehicle.photos[0].url}
                          alt={vehicle.photos[0].altText || vehicle.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-600">
                          <span className="text-5xl lg:text-6xl opacity-50">🚗</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Badges */}
                      <div className="absolute top-3 lg:top-4 left-3 lg:left-4 flex flex-col gap-2 z-10">
                        {vehicle.status && (
                          <span className={`${getStatusBadgeStyle(vehicle.status).bgColor} ${getStatusBadgeStyle(vehicle.status).textColor} text-xs font-bold px-3 lg:px-4 py-1 lg:py-1.5 rounded-full shadow-xl backdrop-blur-md bg-opacity-95 transform group-hover:scale-105 transition-transform duration-300`}>
                            {getStatusBadgeStyle(vehicle.status).label}
                          </span>
                        )}
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-3 lg:bottom-4 right-3 lg:right-4 bg-gradient-to-r from-blue-600/95 to-blue-700/95 backdrop-blur-md text-white px-4 lg:px-5 py-1.5 lg:py-2 rounded-lg lg:rounded-xl font-bold text-base lg:text-lg shadow-2xl border border-white/20 transform group-hover:scale-110 transition-all duration-300">
                        {formatPrice(vehicle.priceCents)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 lg:p-6 flex flex-col flex-grow">
                      <div className="mb-4 lg:mb-5">
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                          {vehicle.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400 font-medium">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {vehicle.year}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {formatMileage(vehicle.odometerKm)}
                          </span>
                        </div>
                      </div>

                      {/* Features Grid - Simplified on Mobile */}
                      <div className="grid grid-cols-2 gap-y-1.5 lg:gap-y-2 gap-x-3 lg:gap-x-4 text-xs lg:text-sm text-gray-400 mb-3 lg:mb-4">
                        <div className="flex items-center gap-1.5 lg:gap-2">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          <span className="truncate">{vehicle.exteriorColor || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 lg:gap-2">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="truncate">{vehicle.fuelType || 'Gasoline'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 lg:gap-2">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span className="truncate">{vehicle.transmission || 'Automatic'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 lg:gap-2">
                          <svg className="w-3 h-3 lg:w-4 lg:h-4 opacity-70 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="truncate">{vehicle.bodyType || 'Sedan'}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-3 lg:pt-5 border-t border-gray-700/50">
                        <span className="text-blue-400 font-semibold text-sm lg:text-base group-hover:translate-x-2 transition-all duration-300 flex items-center gap-2">
                          View Details
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading inventory...</p>
        </div>
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}
