// POST /api/trade-in - Handle trade-in appraisal requests

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const tradeInSchema = z.object({
  vehicle: z.string().min(5, 'Please provide year, make, and model'),
  mileage: z.string().min(1, 'Mileage is required'),
  condition: z.string().min(10, 'Please describe the vehicle condition'),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = tradeInSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { vehicle, mileage, condition, email } = validation.data;

    // Log the submission
    console.log('Trade-In Appraisal Request:', {
      vehicle,
      mileage,
      condition,
      email,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email notification to owner
    // await sendEmail({
    //   to: process.env.ADMIN_EMAIL,
    //   subject: `New Trade-In Appraisal Request - ${vehicle}`,
    //   body: `
    //     Vehicle: ${vehicle}
    //     Mileage: ${mileage}
    //     Condition: ${condition}
    //     Email: ${email}
    //   `,
    // });

    // TODO: Send confirmation email to customer
    // await sendEmail({
    //   to: email,
    //   subject: 'We Received Your Trade-In Request',
    //   body: `Thank you for your interest in trading in your ${vehicle}. We'll review your information and send you a fair offer within 24 hours.`,
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Appraisal request received! Check your email for our offer within 24 hours.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Trade-in form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your request. Please try again.',
      },
      { status: 500 }
    );
  }
}

