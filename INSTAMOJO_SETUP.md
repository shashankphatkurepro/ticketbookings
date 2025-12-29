# Instamojo Payment Gateway - Post-Deployment Setup

## Environment Variables

Set these environment variables in your hosting platform (Vercel, Netlify, etc.):

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
INSTAMOJO_CLIENT_ID=Xxd4qtN4Fx8EsjYjDkodpmQx2cC7GwfVWyWwcXjg
INSTAMOJO_CLIENT_SECRET=jvCCAe2eeaplHD72yzlmhYxA8v85MXGLfzCYwde0T0XYMQMdhFldn4KYTOyvWWIYgQSjQvyJfVgyZdvezMStShXf7Ms2Z4uA70ym9h1NbjHN4PN022DhQ48nXBDDIDz4
INSTAMOJO_SALT=3fb244358f83412fbf024ea91a5f9d1b
INSTAMOJO_ENV=PRODUCTION
```

> **Important:** Replace `https://yourdomain.com` with your actual production domain.

---

## Configure Webhook in Instamojo Dashboard

1. Go to [Instamojo Dashboard](https://www.instamojo.com/integrations/)
2. Navigate to **Developers / API & Plugins** → **Webhooks**
3. Add your webhook URL:
   ```
   https://yourdomain.com/api/payments/webhook
   ```
4. Save the webhook configuration

> **Why is this important?** The webhook enables automatic server-side payment confirmation. Without it, you rely only on client-side verification.

---

## Test a Real Transaction

After deployment, make a small test payment (₹1-10) to verify:

- [ ] Payment flow works end-to-end
- [ ] Webhook receives confirmation
- [ ] Tickets are auto-generated
- [ ] Database is updated correctly
- [ ] Success page shows correctly

---

## Verify in Supabase

After a test payment, run these queries in Supabase SQL Editor:

### Check Payment Logs
```sql
SELECT * FROM payment_logs ORDER BY created_at DESC LIMIT 5;
```

### Check Confirmed Bookings
```sql
SELECT * FROM bookings WHERE payment_status = 'confirmed' ORDER BY created_at DESC LIMIT 5;
```

### Check Generated Tickets
```sql
SELECT t.*, b.booking_id, b.customer_name
FROM tickets t
JOIN bookings b ON t.booking_id = b.id
ORDER BY t.created_at DESC LIMIT 10;
```

---

## Database Schema

The following columns were added to support Instamojo:

### `bookings` table
| Column | Type | Description |
|--------|------|-------------|
| `instamojo_payment_request_id` | TEXT | Instamojo payment request ID |
| `instamojo_payment_id` | TEXT | Instamojo payment ID |
| `instamojo_payment_url` | TEXT | Payment URL for the transaction |
| `payment_method` | TEXT | Payment method used (instamojo) |
| `payment_fees` | DECIMAL | Transaction fees charged |

### `payment_logs` table
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `booking_id` | UUID | Reference to bookings table |
| `event_type` | TEXT | Type: request_created, webhook_received, payment_verified |
| `instamojo_payment_request_id` | TEXT | Payment request ID |
| `instamojo_payment_id` | TEXT | Payment ID |
| `status` | TEXT | Payment status |
| `raw_payload` | JSONB | Full webhook/API response |
| `mac_verified` | BOOLEAN | Whether webhook signature was verified |
| `created_at` | TIMESTAMPTZ | Timestamp |

---

## Troubleshooting

### Payment not confirming automatically
1. Check if webhook URL is correctly configured in Instamojo
2. Verify `NEXT_PUBLIC_BASE_URL` is set to your production domain
3. Check `payment_logs` table for webhook entries

### Webhook not receiving data
1. Ensure your domain is accessible (not localhost)
2. Check server logs for webhook errors
3. Verify the webhook URL doesn't have trailing slashes

### Payment shows pending in database
1. Check `payment_logs` for `mac_verified = false` (signature mismatch)
2. Verify `INSTAMOJO_SALT` is correct
3. Check if webhook was received at all

---

## Files Reference

| File | Purpose |
|------|---------|
| `app/lib/instamojo/types.ts` | Type definitions |
| `app/lib/instamojo/client.ts` | API client with OAuth |
| `app/api/payments/create-request/route.ts` | Creates payment requests |
| `app/api/payments/webhook/route.ts` | Handles Instamojo webhooks |
| `app/api/payments/verify/route.ts` | Verifies payment status |
| `app/components/InstamojoCheckout.tsx` | Checkout modal component |
| `app/checkout/page.tsx` | Checkout page with payment flow |

---

## Support

For Instamojo-related issues:
- [Instamojo API Documentation](https://docs.instamojo.com/)
- [Instamojo Support](https://support.instamojo.com/)
