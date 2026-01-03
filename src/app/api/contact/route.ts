// POST /api/contact - Handle contact form submissions

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendContactFormNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  vehicleInterest: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Contact form API called');
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate input
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation failed:', validation.error);
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { name, email, phone, message, vehicleInterest } = validation.data;
    console.log('Validated data:', { name, email, phone, message, vehicleInterest });

    // Store in database
    console.log('Attempting to save to database...');
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
        vehicleInterest: vehicleInterest && vehicleInterest.trim() ? vehicleInterest.trim() : null,
      },
    });

    console.log('Contact Form Submission saved:', {
      id: submission.id,
      name,
      email,
      phone,
      message,
      vehicleInterest: submission.vehicleInterest,
      timestamp: new Date().toISOString(),
    });

    // Send email notification to owner
    try {
      await sendContactFormNotification({ name, email, phone, message, vehicleInterest });
      console.log('Contact form email notification sent');
    } catch (error) {
      console.error('Failed to send contact form email:', error);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    
    // Provide more specific error message
    let errorMessage = 'Failed to process your request. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('Unknown arg') || error.message.includes('vehicleInterest')) {
        errorMessage = 'Database schema mismatch. Please regenerate Prisma client: npm run db:generate';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

