import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Test Email from Luxor Auto Sales</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Test Message:</strong></p>
          <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
            ${message}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This is a test email from your Luxor Auto Sales website.
        </p>
      </div>
    `;

    const success = await sendEmail(to, subject, html);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send test email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
