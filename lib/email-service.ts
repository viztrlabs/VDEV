/**
 * Email Service
 * 
 * Mock email service for development/demo. In production, replace with
 * Resend, SendGrid, AWS SES, or another email provider.
 */

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface BookingNotificationEmail extends EmailMessage {
  bookingId: string;
  clientName: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ContactNotificationEmail extends EmailMessage {
  contactId: string;
  submitterName: string;
  submitterEmail: string;
  serviceInterest?: string;
  message?: string;
}

const DEFAULT_FROM = 'VizTR Studio <noreply@viztr.com>';
const ADMIN_EMAIL = 'admin@viztr.com';

export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const emailConfig = {
    from: message.from || DEFAULT_FROM,
    to: Array.isArray(message.to) ? message.to : [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
    replyTo: message.replyTo,
    attachments: message.attachments,
  };

  if (process.env.NODE_ENV === 'production') {
    // Production: integrate with Resend, SendGrid, or AWS SES
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // const result = await resend.emails.send(emailConfig);
    // return { success: true, messageId: result.id };
    
    console.log('[Email] Would send in production:', {
      to: emailConfig.to,
      subject: emailConfig.subject,
      from: emailConfig.from,
    });
    return { success: true, messageId: `prod-${Date.now()}` };
  }

  // Development/demo: log to console
  console.log('[Email] New email notification:', {
    to: emailConfig.to,
    subject: emailConfig.subject,
    from: emailConfig.from,
    replyTo: emailConfig.replyTo,
    hasHtml: !!emailConfig.html,
    hasText: !!emailConfig.text,
    attachments: emailConfig.attachments?.length || 0,
    timestamp: new Date().toISOString(),
  });

  return { success: true, messageId: `dev-${Date.now()}` };
}

export async function sendBookingCreatedNotification(booking: {
  id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
}): Promise<void> {
  // Notify client
  await sendEmail({
    to: booking.client_email,
    subject: `Booking Confirmation: ${booking.service_type} Consultation`,
    from: DEFAULT_FROM,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Thank you, ${booking.client_name}!</p>
      <p>Your ${booking.service_type} consultation has been scheduled for ${booking.preferred_date} at ${booking.preferred_time}.</p>
      ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ''}
      <p>Booking ID: ${booking.id}</p>
      <p>We'll send you a calendar invitation shortly.</p>
      <p>Best regards,<br>VizTR Studio</p>
    `,
    text: `
      Booking Confirmed
      
      Thank you, ${booking.client_name}!
      Your ${booking.service_type} consultation has been scheduled for ${booking.preferred_date} at ${booking.preferred_time}.
      ${booking.message ? `Message: ${booking.message}` : ''}
      Booking ID: ${booking.id}
      We'll send you a calendar invitation shortly.
      Best regards,
      VizTR Studio
    `,
  });

  // Notify admin
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Booking: ${booking.service_type} - ${booking.client_name}`,
    from: DEFAULT_FROM,
    html: `
      <h2>New Booking Received</h2>
      <p><strong>Client:</strong> ${booking.client_name}</p>
      <p><strong>Email:</strong> ${booking.client_email}</p>
      <p><strong>Service:</strong> ${booking.service_type}</p>
      <p><strong>Date/Time:</strong> ${booking.preferred_date} at ${booking.preferred_time}</p>
      ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ''}
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p>Please review and approve/reject this booking in the admin dashboard.</p>
    `,
    text: `
      New Booking Received
      Client: ${booking.client_name}
      Email: ${booking.client_email}
      Service: ${booking.service_type}
      Date/Time: ${booking.preferred_date} at ${booking.preferred_time}
      ${booking.message ? `Message: ${booking.message}` : ''}
      Booking ID: ${booking.id}
      Please review and approve/reject this booking in the admin dashboard.
    `,
  });
}

export async function sendBookingStatusNotification(booking: {
  id: string;
  client_name: string;
  client_email: string;
  service_type: string;
  status: 'approved' | 'rejected' | 'completed';
  preferred_date: string;
  preferred_time: string;
  adminNotes?: string;
  rejectionReason?: string;
}): Promise<void> {
  const statusMessages = {
    approved: {
      subject: `Booking Approved: ${booking.service_type} Consultation`,
      message: `Your ${booking.service_type} consultation on ${booking.preferred_date} at ${booking.preferred_time} has been approved.`,
    },
    rejected: {
      subject: `Booking Update: ${booking.service_type} Consultation`,
      message: `Your ${booking.service_type} consultation on ${booking.preferred_date} at ${booking.preferred_time} could not be scheduled.`,
    },
    completed: {
      subject: `Booking Completed: ${booking.service_type} Consultation`,
      message: `Your ${booking.service_type} consultation on ${booking.preferred_date} at ${booking.preferred_time} has been completed.`,
    },
  };

  const statusInfo = statusMessages[booking.status];

  await sendEmail({
    to: booking.client_email,
    subject: statusInfo.subject,
    from: DEFAULT_FROM,
    html: `
      <h2>Booking ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</h2>
      <p>Dear ${booking.client_name},</p>
      <p>${statusInfo.message}</p>
      ${booking.adminNotes ? `<p><strong>Admin Notes:</strong> ${booking.adminNotes}</p>` : ''}
      ${booking.rejectionReason ? `<p><strong>Reason:</strong> ${booking.rejectionReason}</p>` : ''}
      <p>Booking ID: ${booking.id}</p>
      <p>If you have questions, please contact us.</p>
      <p>Best regards,<br>VizTR Studio</p>
    `,
    text: `
      Booking ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
      
      Dear ${booking.client_name},
      ${statusInfo.message}
      ${booking.adminNotes ? `Admin Notes: ${booking.adminNotes}` : ''}
      ${booking.rejectionReason ? `Reason: ${booking.rejectionReason}` : ''}
      Booking ID: ${booking.id}
      If you have questions, please contact us.
      Best regards,
      VizTR Studio
    `,
  });
}

export async function sendContactNotification(contact: {
  id: string;
  name: string;
  email: string;
  company?: string;
  service_interest?: string;
  message?: string;
}): Promise<void> {
  // Notify admin
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Contact Submission: ${contact.name}${contact.company ? ` from ${contact.company}` : ''}`,
    from: DEFAULT_FROM,
    html: `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      ${contact.company ? `<p><strong>Company:</strong> ${contact.company}</p>` : ''}
      ${contact.service_interest ? `<p><strong>Service Interest:</strong> ${contact.service_interest}</p>` : ''}
      ${contact.message ? `<p><strong>Message:</strong> ${contact.message}</p>` : ''}
      <p><strong>Submission ID:</strong> ${contact.id}</p>
      <p>Please respond promptly through the admin dashboard.</p>
    `,
    text: `
      New Contact Submission
      Name: ${contact.name}
      Email: ${contact.email}
      ${contact.company ? `Company: ${contact.company}` : ''}
      ${contact.service_interest ? `Service Interest: ${contact.service_interest}` : ''}
      ${contact.message ? `Message: ${contact.message}` : ''}
      Submission ID: ${contact.id}
      Please respond promptly through the admin dashboard.
    `,
  });

  // Notify user
  await sendEmail({
    to: contact.email,
    subject: 'Thank you for contacting VizTR Studio',
    from: DEFAULT_FROM,
    html: `
      <h2>Thank You for Reaching Out!</h2>
      <p>Dear ${contact.name},</p>
      <p>We've received your inquiry${contact.service_interest ? ` regarding ${contact.service_interest}` : ''} and will get back to you within 24 hours.</p>
      ${contact.message ? `<p><strong>Your Message:</strong> ${contact.message}</p>` : ''}
      <p>Reference ID: ${contact.id}</p>
      <p>Best regards,<br>VizTR Studio Team</p>
    `,
    text: `
      Thank You for Reaching Out!
      
      Dear ${contact.name},
      We've received your inquiry${contact.service_interest ? ` regarding ${contact.service_interest}` : ''} and will get back to you within 24 hours.
      ${contact.message ? `Your Message: ${contact.message}` : ''}
      Reference ID: ${contact.id}
      Best regards,
      VizTR Studio Team
    `,
  });
}
