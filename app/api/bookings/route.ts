import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateBookingInput } from '@/app/lib/supabase/types';
import { nanoid } from 'nanoid';

// Create Supabase client using anon key
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

// Generate a unique booking ID
function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `MNG-${timestamp}-${random}`;
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingInput = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.customer_email || !body.customer_phone) {
      return NextResponse.json(
        { error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    if ((!body.items || body.items.length === 0) && !body.group_booking) {
      return NextResponse.json(
        { error: 'No items in booking' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const bookingId = generateBookingId();

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_id: bookingId,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        items: body.items || [],
        group_booking: body.group_booking,
        subtotal: body.subtotal || 0,
        group_total: body.group_total || 0,
        total_amount: body.total_amount,
        discount_amount: body.discount_amount || 0,
        discount_percentage: body.discount_percentage || 0,
        discount_note: body.discount_note || null,
        payment_status: body.payment_status || 'pending',
        notes: body.notes || null,
        source: body.source || 'website',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: data, bookingId }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const supabase = getSupabaseClient();

    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by status
    if (status && status !== 'all') {
      query = query.eq('payment_status', status);
    }

    // Search by booking ID, name, email, or phone
    if (search) {
      query = query.or(
        `booking_id.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`
      );
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      bookings: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
