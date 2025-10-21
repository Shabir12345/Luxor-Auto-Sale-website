// Common Types for Luxor Auto Sales

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export type VehicleFilters = {
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  bodyType?: string;
  drivetrain?: string;
  fuelType?: string;
  transmission?: string;
  status?: string;
  search?: string;
};

export type SortOption = {
  field: string;
  order: 'asc' | 'desc';
};

export type VehicleFormData = {
  vin: string;
  stockNumber?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  bodyType?: string;
  drivetrain?: string;
  fuelType?: string;
  transmission?: string;
  engine?: string;
  cylinders?: number;
  odometerKm: number;
  priceCents: number;
  status: string;
  exteriorColor?: string;
  interiorColor?: string;
  title: string;
  description?: string;
  features?: { category: string; feature: string }[];
};

export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
};

