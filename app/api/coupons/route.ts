import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateCouponInput } from '@/app/lib/supabase/types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

// Generate random coupon code
function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET - List all coupons (admin)
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
      .from('coupons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by active status
    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    // Search by code or description
    if (search) {
      query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch coupons' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      coupons: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon (admin)
export async function POST(request: NextRequest) {
  try {
    const body: CreateCouponInput & { generate_code?: boolean } = await request.json();

    // Validate required fields
    if (!body.discount_type || body.discount_value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: discount_type and discount_value' },
        { status: 400 }
      );
    }

    // Validate discount_type
    if (!['percentage', 'fixed'].includes(body.discount_type)) {
      return NextResponse.json(
        { error: 'Invalid discount_type. Must be "percentage" or "fixed"' },
        { status: 400 }
      );
    }

    // Validate percentage value
    if (body.discount_type === 'percentage' && (body.discount_value < 0 || body.discount_value > 100)) {
      return NextResponse.json(
        { error: 'Percentage discount must be between 0 and 100' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Generate code if not provided or if generate_code is true
    let couponCode = body.code?.toUpperCase().trim();
    if (!couponCode || body.generate_code) {
      couponCode = generateCouponCode();

      // Make sure code is unique
      let isUnique = false;
      while (!isUnique) {
        const { data: existing } = await supabase
          .from('coupons')
          .select('id')
          .eq('code', couponCode)
          .single();

        if (!existing) {
          isUnique = true;
        } else {
          couponCode = generateCouponCode();
        }
      }
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        description: body.description || null,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_order_amount: body.min_order_amount || 0,
        max_discount_amount: body.max_discount_amount || null,
        usage_limit: body.usage_limit || null,
        valid_from: body.valid_from || new Date().toISOString(),
        valid_until: body.valid_until || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A coupon with this code already exists' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create coupon' },
        { status: 500 }
      );
    }

    return NextResponse.json({ coupon: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/coupons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
