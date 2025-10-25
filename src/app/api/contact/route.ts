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

    const { name, email, phone, message } = validation.data;
    console.log('Validated data:', { name, email, phone, message });

    // Store in database
    console.log('Attempting to save to database...');
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    console.log('Contact Form Submission saved:', {
      id: submission.id,
      name,
      email,
      phone,
      message,
      timestamp: new Date().toISOString(),
    });

    // Send email notification to owner
    try {
      await sendContactFormNotification({ name, email, phone, message });
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
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process your request. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

