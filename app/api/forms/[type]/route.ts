import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    const body = await request.json();

    // Basic honeypot spam protection check
    if (body._hp_field) {
      return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['contact', 'booking', 'demo', 'inquiry', 'newsletter', 'portfolio-enquiry'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid form submission type' }, { status: 400 });
    }

    // Mock successful storage / notification dispatch in server
    console.log(`[Form Submission] Type: ${type}, Payload:`, body);

    return NextResponse.json({
      success: true,
      id: `sub_${Date.now()}`,
      type,
      message: `Form of type ${type} successfully received and queued for architectural lead dispatch.`,
      receivedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Internal server error processing form' }, { status: 500 });
  }
}
