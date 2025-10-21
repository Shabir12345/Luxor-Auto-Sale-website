// Database Seeding Script

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'owner@luxorautosale.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  let adminUser;

  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPassword);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        passwordHash,
        role: 'OWNER',
      },
    });
    console.log(`✅ Created admin user: ${adminEmail}`);
  } else {
    adminUser = existingAdmin;
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`);
  }

  // Create sample vehicles
  const sampleVehicles = [
    {
      vin: '1HGBH41JXMN109186',
      stockNumber: 'LUX001',
      year: 2020,
      make: 'Honda',
      model: 'Civic',
      trim: 'LX',
      bodyType: 'SEDAN',
      drivetrain: 'FWD',
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      engine: '2.0L I4',
      cylinders: 4,
      odometerKm: 45000,
      priceCents: 2199900, // $21,999
      status: 'AVAILABLE',
      exteriorColor: 'Silver',
      interiorColor: 'Black',
      title: '2020 Honda Civic LX',
      description:
        'Clean, reliable sedan with excellent fuel economy. One owner, well-maintained with full service history.',
      seoSlug: '2020-honda-civic-109186',
      publishedAt: new Date(),
      createdById: adminUser.id,
    },
    {
      vin: '5YJSA1E26HF123456',
      stockNumber: 'LUX002',
      year: 2017,
      make: 'Tesla',
      model: 'Model S',
      trim: '75D',
      bodyType: 'SEDAN',
      drivetrain: 'AWD',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      engine: 'Dual Motor',
      odometerKm: 68000,
      priceCents: 4899900, // $48,999
      status: 'AVAILABLE',
      exteriorColor: 'Pearl White',
      interiorColor: 'Black',
      title: '2017 Tesla Model S 75D',
      description:
        'Premium electric sedan with autopilot. Excellent condition with recent battery health check.',
      seoSlug: '2017-tesla-model-s-123456',
      publishedAt: new Date(),
      createdById: adminUser.id,
    },
    {
      vin: '1C4RJFAG7KC654321',
      stockNumber: 'LUX003',
      year: 2019,
      make: 'Jeep',
      model: 'Grand Cherokee',
      trim: 'Laredo',
      bodyType: 'SUV',
      drivetrain: 'FOUR_WD',
      fuelType: 'GASOLINE',
      transmission: 'AUTOMATIC',
      engine: '3.6L V6',
      cylinders: 6,
      odometerKm: 72000,
      priceCents: 3499900, // $34,999
      status: 'AVAILABLE',
      exteriorColor: 'Black',
      interiorColor: 'Gray',
      title: '2019 Jeep Grand Cherokee Laredo',
      description: 'Capable SUV with luxury features. Perfect for families and adventure seekers.',
      seoSlug: '2019-jeep-grand-cherokee-654321',
      publishedAt: new Date(),
      createdById: adminUser.id,
    },
  ];

  for (const vehicleData of sampleVehicles) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vin: vehicleData.vin },
    });

    if (!existingVehicle) {
      const vehicle = await prisma.vehicle.create({
        data: vehicleData,
      });

      // Add sample photos
      await prisma.vehiclePhoto.createMany({
        data: [
          {
            vehicleId: vehicle.id,
            url: `https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800`,
            altText: `${vehicle.title} - Front View`,
            sortOrder: 0,
            isPrimary: true,
          },
          {
            vehicleId: vehicle.id,
            url: `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800`,
            altText: `${vehicle.title} - Side View`,
            sortOrder: 1,
            isPrimary: false,
          },
        ],
      });

      // Add sample features
      await prisma.vehicleFeature.createMany({
        data: [
          { vehicleId: vehicle.id, category: 'Safety', feature: 'Backup Camera' },
          { vehicleId: vehicle.id, category: 'Safety', feature: 'ABS Brakes' },
          { vehicleId: vehicle.id, category: 'Comfort', feature: 'Air Conditioning' },
          { vehicleId: vehicle.id, category: 'Comfort', feature: 'Power Windows' },
          { vehicleId: vehicle.id, category: 'Technology', feature: 'Bluetooth' },
          { vehicleId: vehicle.id, category: 'Technology', feature: 'USB Ports' },
        ],
      });

      console.log(`✅ Created vehicle: ${vehicle.title}`);
    } else {
      console.log(`ℹ️  Vehicle already exists: ${vehicleData.title}`);
    }
  }

  console.log('✨ Database seed completed!');
  console.log(`\n📝 Admin Login:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`\n⚠️  Please change the admin password on first login!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

