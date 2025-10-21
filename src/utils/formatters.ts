// Formatting Utilities

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat('en-US').format(km) + ' km';
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatVehicleTitle(
  year: number,
  make: string,
  model: string,
  trim?: string
): string {
  return trim ? `${year} ${make} ${model} ${trim}` : `${year} ${make} ${model}`;
}

export function formatBodyType(bodyType: string): string {
  const formatted: Record<string, string> = {
    SEDAN: 'Sedan',
    COUPE: 'Coupe',
    HATCHBACK: 'Hatchback',
    WAGON: 'Wagon',
    SUV: 'SUV',
    TRUCK: 'Truck',
    VAN: 'Van',
    CONVERTIBLE: 'Convertible',
    OTHER: 'Other',
  };
  return formatted[bodyType] || bodyType;
}

export function formatDrivetrain(drivetrain: string): string {
  const formatted: Record<string, string> = {
    FWD: 'Front-Wheel Drive',
    RWD: 'Rear-Wheel Drive',
    AWD: 'All-Wheel Drive',
    FOUR_WD: '4-Wheel Drive',
  };
  return formatted[drivetrain] || drivetrain;
}

export function formatFuelType(fuelType: string): string {
  const formatted: Record<string, string> = {
    GASOLINE: 'Gasoline',
    DIESEL: 'Diesel',
    HYBRID: 'Hybrid',
    ELECTRIC: 'Electric',
    PLUG_IN_HYBRID: 'Plug-in Hybrid',
  };
  return formatted[fuelType] || fuelType;
}

export function formatTransmission(transmission: string): string {
  const formatted: Record<string, string> = {
    AUTOMATIC: 'Automatic',
    MANUAL: 'Manual',
    CVT: 'CVT',
    DCT: 'Dual-Clutch',
  };
  return formatted[transmission] || transmission;
}

