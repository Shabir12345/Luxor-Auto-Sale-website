import React from 'react';
import Select from '@/components/Select';
import { FilterState } from '@/hooks/useVehicleFilters';

interface FilterSidebarProps {
  filters: FilterState;
  setFilter: (name: keyof FilterState, value: string) => void;
  clearFilters: () => void;
  availableMakes: string[];
  availableModels: string[];
  className?: string;
}

export default function FilterSidebar({
  filters,
  setFilter,
  clearFilters,
  availableMakes,
  availableModels,
  className = '',
}: FilterSidebarProps) {
  
  const transmissionOptions = [
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
    { value: 'CVT', label: 'CVT' },
  ];

  const fuelTypeOptions = [
    { value: 'Gasoline', label: 'Gasoline' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Electric', label: 'Electric' },
  ];

  const bodyTypeOptions = [
    { value: 'SEDAN', label: 'Sedan' },
    { value: 'SUV', label: 'SUV' },
    { value: 'TRUCK', label: 'Truck' },
    { value: 'COUPE', label: 'Coupe' },
    { value: 'HATCHBACK', label: 'Hatchback' },
    { value: 'VAN', label: 'Van' },
    { value: 'WAGON', label: 'Wagon' },
    { value: 'CONVERTIBLE', label: 'Convertible' },
  ];

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest').length;

  return (
    <div className={`bg-gradient-to-br from-gray-800/95 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/60 p-6 shadow-2xl ${className} transition-all duration-300 hover:shadow-blue-500/10`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-gray-700/60">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg border border-blue-500/30">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">
              {activeFilterCount}
            </span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-400 hover:text-blue-300 transition-all duration-300 font-semibold hover:underline flex items-center gap-1 group"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        )}
      </div>

      <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2">
        {/* Search */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Keywords, make, model..."
              className="w-full bg-gray-900/60 border-2 border-gray-600/50 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-500 shadow-lg"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Make & Model */}
        <div className="space-y-5">
          <div className="group">
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Vehicle
            </label>
            <div className="space-y-4">
              <Select
                value={filters.make}
                onChange={(val) => setFilter('make', val)}
                options={availableMakes.map(m => ({ value: m, label: m }))}
                placeholder="All Makes"
                className="w-full"
              />
              <Select
                value={filters.model}
                onChange={(val) => setFilter('model', val)}
                options={availableModels.map(m => ({ value: m, label: m }))}
                placeholder="All Models"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="group">
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilter('minPrice', e.target.value)}
                placeholder="Min"
                className="w-full bg-gray-900/60 border-2 border-gray-600/50 rounded-xl py-3 pl-8 pr-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-lg"
              />
            </div>
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value)}
                placeholder="Max"
                className="w-full bg-gray-900/60 border-2 border-gray-600/50 rounded-xl py-3 pl-8 pr-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Year & Mileage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Year
            </label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilter('year', e.target.value)}
              placeholder="Min Year"
              className="w-full bg-gray-900/60 border-2 border-gray-600/50 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-lg"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Mileage
            </label>
            <div className="relative">
              <input
                type="number"
                value={filters.maxMileage}
                onChange={(e) => setFilter('maxMileage', e.target.value)}
                placeholder="Max"
                className="w-full bg-gray-900/60 border-2 border-gray-600/50 rounded-xl py-3 pr-12 pl-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">km</span>
            </div>
          </div>
        </div>

        {/* Detailed Filters */}
        <div className="space-y-5 pt-4 border-t border-gray-700/60">
          <div className="group">
            <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Specifications
            </label>
            <div className="space-y-4">
              <Select
                label=""
                value={filters.bodyType}
                onChange={(val) => setFilter('bodyType', val)}
                options={bodyTypeOptions}
                placeholder="Body Type"
              />
              <Select
                label=""
                value={filters.transmission}
                onChange={(val) => setFilter('transmission', val)}
                options={transmissionOptions}
                placeholder="Transmission"
              />
              <Select
                label=""
                value={filters.fuelType}
                onChange={(val) => setFilter('fuelType', val)}
                options={fuelTypeOptions}
                placeholder="Fuel Type"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
