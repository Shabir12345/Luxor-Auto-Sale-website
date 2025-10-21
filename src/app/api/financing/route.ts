// POST /api/financing - Handle financing application submissions

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    // Log the submission
    console.log('Financing Application Submission:', {
      firstName,
      lastName,
      email,
      phone,
      vehicleInterest,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email notification to owner
    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `New Financing Application from ${firstName} ${lastName}`,
    //   body: `
    //     Name: ${firstName} ${lastName}
    //     Email: ${email}
    //     Phone: ${phone}
    //     Vehicle of Interest: ${vehicleInterest || 'Not specified'}
    //   `,
    // });

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

