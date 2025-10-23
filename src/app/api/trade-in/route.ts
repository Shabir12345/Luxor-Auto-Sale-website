// POST /api/trade-in - Handle trade-in appraisal requests

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendTradeInRequestNotification } from '@/lib/email';

const tradeInSchema = z.object({
  vehicle: z.string().min(1, 'Vehicle information is required'),
  mileage: z.string().min(1, 'Mileage is required'),
  condition: z.string().min(1, 'Condition description is required'),
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Trade-in form API called');
    const body = await request.json();
    console.log('Request body:', body);
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body || {}));
    
    // Check if body is valid
    if (!body || typeof body !== 'object') {
      console.log('Invalid body received');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
        },
        { status: 400 }
      );
    }
    
    // Validate input
    const validation = tradeInSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation failed:', validation.error.errors);
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { vehicle, mileage, condition, email } = validation.data;

    // Store in database
    const tradeInRequest = await prisma.tradeInRequest.create({
      data: {
        vehicle,
        mileage,
        condition,
        email,
      },
    });

    console.log('Trade-In Request saved:', {
      id: tradeInRequest.id,
      vehicle,
      mileage,
      condition,
      email,
      timestamp: new Date().toISOString(),
    });

    // Send email notification to owner
    try {
      await sendTradeInRequestNotification({ vehicle, mileage, condition, email });
      console.log('Trade-in request email notification sent');
    } catch (error) {
      console.error('Failed to send trade-in request email:', error);
      // Don't fail the request if email fails
    }

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

