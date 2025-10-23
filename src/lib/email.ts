// Email service using Nodemailer with Gmail

import nodemailer from 'nodemailer';

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Your Gmail App Password
    },
  });
};

// Email templates
export const emailTemplates = {
  contactForm: (data: { name: string; email: string; phone?: string; message: string }) => ({
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
            ${data.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This message was sent from your Luxor Auto Sales website contact form.
        </p>
      </div>
    `,
  }),

  financingApplication: (data: { firstName: string; lastName: string; email: string; phone: string; vehicleInterest?: string }) => ({
    subject: `New Financing Application from ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Financing Application</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Applicant Details</h3>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Vehicle of Interest:</strong> ${data.vehicleInterest || 'Not specified'}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong> Contact the applicant within 24 hours to discuss financing options.</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This application was submitted through your Luxor Auto Sales website financing form.
        </p>
      </div>
    `,
  }),

  tradeInRequest: (data: { vehicle: string; mileage: string; condition: string; email: string }) => ({
    subject: `New Trade-In Appraisal Request - ${data.vehicle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Trade-In Appraisal Request</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Vehicle Details</h3>
          <p><strong>Vehicle:</strong> ${data.vehicle}</p>
          <p><strong>Mileage:</strong> ${data.mileage}</p>
          <p><strong>Condition:</strong></p>
          <div style="background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 10px 0;">
            ${data.condition.replace(/\n/g, '<br>')}
          </div>
          <p><strong>Contact Email:</strong> ${data.email}</p>
        </div>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Action Required:</strong> Review the vehicle details and send a fair appraisal offer within 24 hours.</p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          This request was submitted through your Luxor Auto Sales website trade-in form.
        </p>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('Email not configured - skipping email notification');
      console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
      console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? 'Set' : 'Not set');
      return false;
    }

    console.log('Attempting to send email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', to);
    console.log('Subject:', subject);

    const transporter = createTransporter();
    
    // Test the connection first
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    const mailOptions = {
      from: `"Luxor Auto Sales" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

// Send notification emails for form submissions
export async function sendContactFormNotification(data: { name: string; email: string; phone?: string; message: string }): Promise<boolean> {
  const template = emailTemplates.contactForm(data);
  return await sendEmail(process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '', template.subject, template.html);
}

export async function sendFinancingApplicationNotification(data: { firstName: string; lastName: string; email: string; phone: string; vehicleInterest?: string }): Promise<boolean> {
  const template = emailTemplates.financingApplication(data);
  return await sendEmail(process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '', template.subject, template.html);
}

export async function sendTradeInRequestNotification(data: { vehicle: string; mileage: string; condition: string; email: string }): Promise<boolean> {
  const template = emailTemplates.tradeInRequest(data);
  return await sendEmail(process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '', template.subject, template.html);
}
