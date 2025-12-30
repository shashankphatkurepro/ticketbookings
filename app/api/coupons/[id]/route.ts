import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

// GET - Get a single coupon
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coupon: data });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabaseClient();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    if (body.code !== undefined) updateData.code = body.code.toUpperCase().trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type;
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value;
    if (body.min_order_amount !== undefined) updateData.min_order_amount = body.min_order_amount;
    if (body.max_discount_amount !== undefined) updateData.max_discount_amount = body.max_discount_amount;
    if (body.usage_limit !== undefined) updateData.usage_limit = body.usage_limit;
    if (body.valid_from !== undefined) updateData.valid_from = body.valid_from;
    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating coupon:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A coupon with this code already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update coupon' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ coupon: data });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting coupon:', error);
      return NextResponse.json(
        { error: 'Failed to delete coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Increment usage count (called after successful payment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseClient();

    // Increment usage_count
    const { data, error } = await supabase.rpc('increment_coupon_usage', { coupon_id: id });

    if (error) {
      // Fallback: manually increment if RPC doesn't exist
      const { data: coupon } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (coupon) {
        const { data: updated, error: updateError } = await supabase
          .from('coupons')
          .update({ usage_count: (coupon.usage_count || 0) + 1 })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update usage count' },
            { status: 500 }
          );
        }

        return NextResponse.json({ coupon: updated });
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
