// SEO Slug Generation

export function generateVehicleSlug(
  year: number,
  make: string,
  model: string,
  vin: string
): string {
  const vinSuffix = vin.slice(-6).toLowerCase();
  const slug = `${year}-${make}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug}-${vinSuffix}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

