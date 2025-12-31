import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { nanoid } from 'nanoid';

interface WalkInRequest {
  name: string;
  email: string;
  phone: string;
  ticket_type: string;
  quantity: number;
  notes?: string;
}

// POST - Create walk-in entry
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WalkInRequest;

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!body.phone?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!body.ticket_type) {
      return NextResponse.json(
        { error: 'Ticket type is required' },
        { status: 400 }
      );
    }
    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create a virtual booking for walk-in people
    const bookingId = `WI-${nanoid(8)}`;

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_id: bookingId,
        customer_name: body.name,
        customer_email: body.email || null,
        customer_phone: body.phone,
        items: [
          {
            ticketName: body.ticket_type,
            ticketId: body.ticket_type,
            price: 0,
            quantity: body.quantity,
          },
        ],
        subtotal: 0,
        group_total: 0,
        total_amount: 0,
        discount_amount: 0,
        discount_percentage: 0,
        payment_status: 'confirmed',
        tickets_generated: true,
        tickets_sent: false,
        source: 'walk-in',
        notes: body.notes || null,
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      console.error('Error creating walk-in booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create walk-in booking' },
        { status: 500 }
      );
    }

    // Create tickets for walk-in entry (immediately marked as used)
    const tickets = [];
    for (let i = 1; i <= body.quantity; i++) {
      tickets.push({
        ticket_id: `WI-${nanoid(10)}`,
        booking_id: booking.id,
        ticket_type: body.ticket_type,
        ticket_price: 0,
        attendee_number: i,
        qr_code_data: `WI-${nanoid(10)}`,
        is_used: true,
        used_at: new Date().toISOString(),
        used_by: 'Walk-in',
      });
    }

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(tickets);

    if (ticketsError) {
      console.error('Error creating walk-in tickets:', ticketsError);
      // Clean up the booking if tickets fail
      await supabase.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Failed to create walk-in tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Walk-in entry added for ${body.name} with ${body.quantity} ticket(s)`,
        booking_id: bookingId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing walk-in:', error);
    return NextResponse.json(
      { error: 'Failed to process walk-in entry' },
      { status: 500 }
    );
  }
}

// GET - Get all walk-in entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    // Get walk-in bookings
    const { data: walkIns, error: walkInError, count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('source', 'walk-in')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (walkInError) throw walkInError;

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      walk_ins: walkIns || [],
      total: count || 0,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Error fetching walk-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch walk-in entries' },
      { status: 500 }
    );
  }
}
