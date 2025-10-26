import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Test database connection
    const vehicleCount = await prisma.vehicle.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      vehicleCount,
      prismaInitialized: !!prisma,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      name: error.name,
      code: error.code,
    }, { status: 500 });
  }
}
