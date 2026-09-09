import { NextRequest, NextResponse } from 'next/server';
import { isLeadType, saveLead } from '@/lib/leadsStore';

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

    if (!isLeadType(type)) {
      return NextResponse.json({ error: 'Invalid form submission type' }, { status: 400 });
    }

    const lead = await saveLead(type, body);
    return NextResponse.json({
      success: true,
      id: lead.id,
      type,
      message: `Form of type ${type} received and persisted.`,
      receivedAt: lead.receivedAt,
    });
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json({ error: 'Internal server error processing form' }, { status: 500 });
  }
}
