import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Coupon, CouponValidationResult } from '@/app/lib/supabase/types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

// POST - Validate a coupon code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, order_total } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Coupon code is required' } as CouponValidationResult,
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch the coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid coupon code' } as CouponValidationResult,
        { status: 200 }
      );
    }

    const typedCoupon = coupon as Coupon;

    // Check if coupon is active
    if (!typedCoupon.is_active) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is no longer active' } as CouponValidationResult,
        { status: 200 }
      );
    }

    // Check validity dates
    const now = new Date();
    const validFrom = new Date(typedCoupon.valid_from);
    if (now < validFrom) {
      return NextResponse.json(
        { valid: false, error: 'This coupon is not yet valid' } as CouponValidationResult,
        { status: 200 }
      );
    }

    if (typedCoupon.valid_until) {
      const validUntil = new Date(typedCoupon.valid_until);
      if (now > validUntil) {
        return NextResponse.json(
          { valid: false, error: 'This coupon has expired' } as CouponValidationResult,
          { status: 200 }
        );
      }
    }

    // Check usage limit
    if (typedCoupon.usage_limit !== null && typedCoupon.usage_count >= typedCoupon.usage_limit) {
      return NextResponse.json(
        { valid: false, error: 'This coupon has reached its usage limit' } as CouponValidationResult,
        { status: 200 }
      );
    }

    // Check minimum order amount
    if (order_total && typedCoupon.min_order_amount > 0 && order_total < typedCoupon.min_order_amount) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order amount of ₹${typedCoupon.min_order_amount} required`
        } as CouponValidationResult,
        { status: 200 }
      );
    }

    // Calculate discount
    let discount_amount = 0;
    if (order_total) {
      if (typedCoupon.discount_type === 'percentage') {
        discount_amount = (order_total * typedCoupon.discount_value) / 100;
        // Apply max discount cap if set
        if (typedCoupon.max_discount_amount !== null && discount_amount > typedCoupon.max_discount_amount) {
          discount_amount = typedCoupon.max_discount_amount;
        }
      } else {
        discount_amount = typedCoupon.discount_value;
        // Ensure discount doesn't exceed order total
        if (discount_amount > order_total) {
          discount_amount = order_total;
        }
      }
    }

    return NextResponse.json({
      valid: true,
      coupon: typedCoupon,
      discount_amount: Math.round(discount_amount),
    } as CouponValidationResult);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' } as CouponValidationResult,
      { status: 500 }
    );
  }
}
