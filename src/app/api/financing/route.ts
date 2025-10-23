// POST /api/financing - Handle financing application submissions

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendFinancingApplicationNotification } from '@/lib/email';

const financingSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  vehicleInterest: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = financingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, vehicleInterest } = validation.data;

    // Store in database
    const application = await prisma.financingApplication.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        vehicleInterest,
      },
    });

    console.log('Financing Application saved:', {
      id: application.id,
      firstName,
      lastName,
      email,
      phone,
      vehicleInterest,
      timestamp: new Date().toISOString(),
    });

    // Send email notification to owner
    try {
      await sendFinancingApplicationNotification({ firstName, lastName, email, phone, vehicleInterest });
      console.log('Financing application email notification sent');
    } catch (error) {
      console.error('Failed to send financing application email:', error);
      // Don't fail the request if email fails
    }

    // TODO: Forward to financing partner API if applicable
    
    return NextResponse.json(
      {
        success: true,
        message: 'Application received! Our financing team will contact you within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Financing form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your application. Please try again.',
      },
      { status: 500 }
    );
  }
}

