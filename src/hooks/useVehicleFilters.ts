import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface FilterState {
  search: string;
  make: string;
  model: string;
  year: string;
  minPrice: string;
  maxPrice: string;
  maxMileage: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  sortBy: string;
}

const initialState: FilterState = {
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
};

export function useVehicleFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL
  useEffect(() => {
    const newFilters = { ...initialState };
    searchParams.forEach((value, key) => {
      if (key in newFilters) {
        (newFilters as any)[key] = value;
      }
    });
    setFilters(newFilters);
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change (debounced for text inputs)
  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    router.push(`/inventory?${params.toString()}`, { scroll: false });
  }, [router]);

  const setFilter = useCallback((name: keyof FilterState, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      // Reset model if make changes
      if (name === 'make') {
        newFilters.model = '';
      }
      updateUrl(newFilters);
      return newFilters;
    });
  }, [updateUrl]);

  const clearFilters = useCallback(() => {
    setFilters(initialState);
    router.push('/inventory', { scroll: false });
  }, [router]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      return value !== '' && key !== 'sortBy';
    }).length;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilters,
    activeFilterCount,
    isInitialized,
  };
}

