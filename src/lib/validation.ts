// Zod Validation Schemas

import { z } from 'zod';

// User Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['OWNER', 'STAFF', 'VIEWER']).default('STAFF'),
});

// Vehicle Schemas
export const createVehicleSchema = z.object({
  vin: z.string().min(17).max(17, 'VIN must be exactly 17 characters'),
  stockNumber: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  trim: z.string().optional(),
  bodyType: z
    .enum([
      'SEDAN',
      'COUPE',
      'HATCHBACK',
      'WAGON',
      'SUV',
      'TRUCK',
      'VAN',
      'CONVERTIBLE',
      'OTHER',
    ])
    .optional(),
  drivetrain: z.enum(['FWD', 'RWD', 'AWD', 'FOUR_WD']).optional(),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC', 'PLUG_IN_HYBRID']).optional(),
  transmission: z.enum(['AUTOMATIC', 'MANUAL', 'CVT', 'DCT']).optional(),
  engine: z.string().optional(),
  cylinders: z.number().int().min(2).max(16).optional(),
  odometerKm: z.number().int().min(0),
  priceCents: z.number().int().min(0),
  status: z.enum(['AVAILABLE', 'PENDING', 'SOLD', 'DRAFT']).default('DRAFT'),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  id: z.string().cuid(),
});

export const vehicleFiltersSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  minYear: z.number().int().optional(),
  maxYear: z.number().int().optional(),
  minPrice: z.number().int().optional(),
  maxPrice: z.number().int().optional(),
  maxMileage: z.number().int().optional(),
  bodyType: z.string().optional(),
  drivetrain: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(12),
  sortBy: z.enum(['price', 'year', 'odometer', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Photo Schemas
export const createPhotoSchema = z.object({
  vehicleId: z.string().cuid(),
  url: z.string().url(),
  altText: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const updatePhotoSchema = createPhotoSchema.partial().extend({
  id: z.string().cuid(),
});

