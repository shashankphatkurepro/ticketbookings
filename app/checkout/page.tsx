'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 as LoaderSpinner } from 'lucide-react';
import Link from 'next/link';
import { useBooking } from '../context/BookingContext';
import { eventData } from '../data/eventData';
import { InstamojoCheckout, openInstamojoCheckout, InstamojoResponse } from '../components/InstamojoCheckout';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Minus,
  Plus,
  Trash2,
  User,
  Users,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  Ticket,
  Sparkles,
  AlertCircle,
  TrendingUp,
  PartyPopper,
  Copy,
  Check,
  CreditCard,
  Wallet,
  Tag,
  X,
} from 'lucide-react';
import { Coupon } from '../lib/supabase/types';

const WHATSAPP_NUMBER = '917977127312';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { booking, removeFromCart, addToCart, updateQuantity, getTotalAmount, getTotalItems, setCustomerInfo, clearCart, setPaymentComplete, getGroupBookingTotal, getGroupBookingItems } = useBooking();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentRequestId, setPaymentRequestId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isInstamojoLoaded, setIsInstamojoLoaded] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [generatedTickets, setGeneratedTickets] = useState<Array<{ ticket_id: string; ticket_type: string }>>([]);
  // Check if we're returning from a payment redirect on initial load
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get('payment_status');
      const bookingIdParam = params.get('booking_id');
      return (paymentStatus === 'success' || paymentStatus === 'Credit') && !!bookingIdParam;
    }
    return false;
  });
  const [formData, setFormData] = useState({
    name: booking.customerInfo.name,
    email: booking.customerInfo.email,
    phone: booking.customerInfo.phone,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Handle successful payment redirect from Instamojo
  useEffect(() => {
    const paymentStatus = searchParams.get('payment_status');
    const bookingIdParam = searchParams.get('booking_id');
    const paymentId = searchParams.get('payment_id');
    const paymentReqId = searchParams.get('payment_request_id');

    if ((paymentStatus === 'success' || paymentStatus === 'Credit') && bookingIdParam) {
      // Show verifying state while we confirm payment
      setIsVerifyingPayment(true);
      // Verify payment with backend
      verifyPayment(paymentReqId || '', paymentId || '');
    }
  }, [searchParams]);

  const fetchTickets = async (bId: string) => {
    try {
      // Wait a moment for tickets to be generated
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`/api/bookings/${bId}`);
      const data = await response.json();
      if (data.tickets && data.tickets.length > 0) {
        setGeneratedTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const verifyPayment = async (paymentReqId: string, paymentId: string) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_request_id: paymentReqId,
          payment_id: paymentId,
        }),
      });

      const data = await response.json();
      if (data.success && data.status === 'confirmed') {
        setBookingId(data.bookingId);
        setPaymentComplete(data.bookingId, paymentId);
        setIsComplete(true);
        setIsVerifyingPayment(false);
        // Fetch tickets for download using UUID
        if (data.bookingUuid) {
          fetchTickets(data.bookingUuid);
        }
      } else {
        // Payment not confirmed yet - might need retry or show error
        setIsVerifyingPayment(false);
        setPaymentError('Payment verification pending. Please check your booking status or contact support.');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setIsVerifyingPayment(false);
      setPaymentError('Payment verification failed. Please contact support.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalItems = getTotalItems();
  const subtotal = getTotalAmount();
  const groupBookingTotal = getGroupBookingTotal();
  const groupBookingItems = getGroupBookingItems();
  const orderSubtotal = subtotal + groupBookingTotal;
  const totalAmount = orderSubtotal - couponDiscount;
  const hasGroupBooking = groupBookingItems.length > 0;

  // Validate coupon when order total changes
  useEffect(() => {
    if (appliedCoupon && orderSubtotal > 0) {
      // Recalculate discount when order total changes
      validateCoupon(appliedCoupon.code, true);
    }
  }, [orderSubtotal]);

  const validateCoupon = async (code: string, silent = false) => {
    if (!code.trim()) {
      if (!silent) setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          order_total: orderSubtotal,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discount_amount);
        setCouponCode('');
      } else {
        if (!silent) {
          setCouponError(data.error || 'Invalid coupon code');
        }
        // If revalidating and coupon is no longer valid, remove it
        if (silent && appliedCoupon) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
        }
      }
    } catch (error) {
      if (!silent) setCouponError('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  };

  // Instamojo payment handlers
  const handlePaymentSuccess = useCallback(async (response: InstamojoResponse) => {
    console.log('Payment success callback:', response);
    setIsProcessing(true);

    try {
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_request_id: paymentRequestId,
          payment_id: response.paymentId,
        }),
      });

      const data = await verifyResponse.json();
      if (data.success && data.status === 'confirmed') {
        setBookingId(data.bookingId);
        setPaymentComplete(data.bookingId, response.paymentId || '');
        setIsComplete(true);
        // Fetch tickets for download using UUID
        if (data.bookingUuid) {
          fetchTickets(data.bookingUuid);
        }
      } else {
        setPaymentError('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError('Payment verification failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  }, [paymentRequestId, setPaymentComplete]);

  const handlePaymentFailure = useCallback((response: InstamojoResponse) => {
    console.log('Payment failed:', response);
    setPaymentError('Payment failed. Please try again.');
    setIsProcessing(false);
  }, []);

  const handlePaymentClose = useCallback(() => {
    console.log('Payment modal closed');
    if (!isComplete) {
      setIsProcessing(false);
    }
  }, [isComplete]);

  const handleInstamojoLoad = useCallback(() => {
    setIsInstamojoLoaded(true);
  }, []);

  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^0?[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1 && (totalItems > 0 || hasGroupBooking)) {
      setStep(2);
    } else if (step === 2) {
      if (validateForm()) {
        setCustomerInfo(formData);
        setStep(3);
      }
    }
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment request via API
      const response = await fetch('/api/payments/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          items: booking.items,
          group_booking: hasGroupBooking ? booking.groupBooking : null,
          subtotal: subtotal,
          group_total: groupBookingTotal,
          total_amount: totalAmount,
          coupon_id: appliedCoupon?.id || null,
          coupon_code: appliedCoupon?.code || null,
          discount_amount: couponDiscount,
        }),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        setBookingId(data.bookingId);
        setPaymentRequestId(data.paymentRequestId);
        setPaymentUrl(data.paymentUrl);

        // Open Instamojo seamless checkout modal
        const opened = openInstamojoCheckout(data.paymentUrl);
        if (!opened) {
          // Fallback: redirect to payment URL if modal fails
          window.location.href = data.paymentUrl;
        }
      } else {
        setPaymentError(data.error || 'Failed to create payment request');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setPaymentError('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const openWhatsAppForScreenshot = () => {
    const ticketsList = booking.items.map(item => `${item.ticketName} x${item.quantity}`);
    const groupList = groupBookingItems.map(item => `${item.name} x${item.quantity}`);
    const allItems = [...ticketsList, ...groupList].join(', ');

    const message = `Hi! I have completed payment for my booking.

Booking ID: ${bookingId}
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Amount: ${formatPrice(totalAmount)}
Tickets: ${allItems}

Please find the payment screenshot attached.`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Verifying Payment State - Show while verifying payment from redirect
  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
        <div className="max-w-md w-full glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <LoaderSpinner className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1.5 sm:mb-2">Verifying Payment...</h1>
          <p className="text-sm sm:text-base text-gray-600">Please wait while we confirm your payment</p>
          <p className="text-xs text-gray-500 mt-4">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  // Success State
  if (isComplete) {
    return (
      <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="max-w-lg mx-auto">
          {/* Instamojo Checkout Script */}
          <InstamojoCheckout
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onClose={handlePaymentClose}
            onLoad={handleInstamojoLoad}
          />

          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 mx-auto" style={{ width: '4.5rem', height: '4.5rem' }}>
                <CheckCircle2 className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
                <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Payment Successful!</h1>
            <p className="text-sm sm:text-base text-gray-500">Your tickets have been generated</p>
          </div>

          {/* Booking Summary Card */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">Booking ID</p>
                  <p className="text-base sm:text-xl font-bold text-gray-800 font-mono">{bookingId}</p>
                </div>
              </div>
              <button
                onClick={copyBookingId}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl text-gray-600 text-xs sm:text-sm font-medium transition-colors self-start sm:self-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Order Details */}
            <div className="space-y-2 sm:space-y-3 mb-4">
              {booking.items.map((item) => (
                <div key={item.ticketId} className="flex justify-between items-center p-2.5 sm:p-3 glass-card rounded-lg sm:rounded-xl">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.ticketName}</p>
                    <p className="text-xs sm:text-sm text-gray-500">x {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {groupBookingItems.map((item, index) => (
                <div key={`group-${index}`} className="flex justify-between items-center p-2.5 sm:p-3 glass-card rounded-lg sm:rounded-xl bg-emerald-50">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">x {item.quantity} @ {formatPrice(item.price)}/head</p>
                  </div>
                  <span className="font-semibold text-emerald-700 text-sm sm:text-base flex-shrink-0">
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 sm:pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Total Amount</span>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Download Tickets */}
          {generatedTickets.length > 0 && (
            <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-purple-50 to-indigo-50">
              <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                Download Your Tickets
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {generatedTickets.map((ticket, index) => (
                  <a
                    key={ticket.ticket_id}
                    href={`/api/tickets/${ticket.ticket_id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">
                          Ticket #{index + 1}
                        </p>
                        <p className="text-xs text-gray-500">{ticket.ticket_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-600 group-hover:text-purple-700">
                      <span className="text-xs sm:text-sm font-medium">Download PDF</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Loading tickets */}
          {generatedTickets.length === 0 && (
            <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <LoaderSpinner className="w-5 h-5 text-purple-600 animate-spin" />
                <p className="text-sm text-gray-600">Preparing your tickets for download...</p>
              </div>
            </div>
          )}

          {/* Tickets Sent Confirmation */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Tickets Also Sent!</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Your tickets have been sent to <strong>{formData.email}</strong>.
                You will also receive them on WhatsApp shortly.
              </p>
            </div>
          </div>

          {/* What&apos;s Next */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              What&apos;s Next
            </h3>
            <ol className="space-y-2.5 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</span>
                <p className="text-xs sm:text-sm text-gray-600">Check your email for the tickets</p>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</span>
                <p className="text-xs sm:text-sm text-gray-600">Show your QR code at the venue entrance</p>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</span>
                <p className="text-xs sm:text-sm text-gray-600">Have an amazing New Year&apos;s Eve!</p>
              </li>
            </ol>
          </div>

          {/* Back to Home */}
          <button
            onClick={() => {
              clearCart();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 glass-card hover:bg-gray-50 rounded-xl sm:rounded-2xl text-gray-700 font-semibold text-base sm:text-lg transition-all"
          >
            Back to Home
          </button>

          {/* Footer Note */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-indigo-50 rounded-xl sm:rounded-2xl border border-indigo-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-indigo-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Need Help?</p>
                <p className="text-xs sm:text-sm text-indigo-700">
                  Contact us on WhatsApp at +91 79771 27312 for any queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State - Show available tickets
  if (totalItems === 0 && !hasGroupBooking && step === 1) {
    return (
      <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 glass-card rounded-lg sm:rounded-xl text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Mangozzz Resort"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-contain"
              />
            </div>
          </div>

          {/* Payment Error Message */}
          {paymentError && (
            <div className="mb-6 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Payment Verification Issue</h3>
                  <p className="text-sm text-red-700">{paymentError}</p>
                  <p className="text-xs text-red-600 mt-2">
                    If you completed payment, please contact us on WhatsApp at +91 79771 27312 with your payment details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty Cart Message */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1.5 sm:mb-2">Your Cart is Empty</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Select tickets below to add them to your cart
            </p>
          </div>

          {/* Available Tickets */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Available Tickets</h2>
                <p className="text-xs sm:text-sm text-gray-500">New Year&apos;s Eve 2026 · 31st December</p>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4">
              {eventData.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 glass-card rounded-xl sm:rounded-2xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{ticket.name}</h3>
                      {ticket.popular && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{ticket.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-base sm:text-lg font-bold text-gray-800">
                        {formatPrice(ticket.price)}
                      </p>
                      {ticket.originalPrice > ticket.price && (
                        <p className="text-xs sm:text-sm text-gray-400 line-through">
                          {formatPrice(ticket.originalPrice)}
                        </p>
                      )}
                      <span className="text-xs sm:text-sm font-normal text-gray-500">/ person</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(ticket.id, ticket.name, ticket.price)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all hover:-translate-y-0.5 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Event Info Footer */}
          <div className="mt-4 sm:mt-6 glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span>31st Dec 2025</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>7:00 PM onwards</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>Karjat, Chowk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 px-3 sm:py-6 sm:px-4 md:py-8 lg:px-6">
      {/* Instamojo Checkout Script */}
      <InstamojoCheckout
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onClose={handlePaymentClose}
        onLoad={handleInstamojoLoad}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 glass-card rounded-lg sm:rounded-xl text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Mangozzz Resort"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-contain"
            />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-800">Mangozzz</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Resort</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 md:mb-10">
          {[
            { num: 1, label: 'Review' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                disabled={s.num > step}
                className={`flex items-center gap-1 sm:gap-2 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl transition-all ${
                  step === s.num
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : step > s.num
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold ${
                    step === s.num ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {s.num}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-medium hidden xs:inline">{s.label}</span>
              </button>
              {i < 2 && <div className="w-4 sm:w-8 md:w-12 h-0.5 bg-gray-200 rounded" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-1">
            {/* Step 1: Review Tickets */}
            {step === 1 && (
              <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Review Your Tickets</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Make sure everything looks good</p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {booking.items.map((item) => {
                    const ticket = eventData.tickets.find((t) => t.id === item.ticketId);
                    return (
                      <div
                        key={item.ticketId}
                        className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 glass-card rounded-xl sm:rounded-2xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{item.ticketName}</h3>
                            {ticket?.popular && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center gap-1">
                                <TrendingUp className="w-2.5 h-2.5" />
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{ticket?.description}</p>
                          <p className="text-base sm:text-lg font-bold text-gray-800 mt-2">
                            {formatPrice(item.price)} <span className="text-xs sm:text-sm font-normal text-gray-500">/ person</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden">
                            <button
                              onClick={() => removeFromCart(item.ticketId)}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 sm:w-10 text-center font-bold text-gray-800 text-sm sm:text-base">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item.ticketId, item.ticketName, item.price)}
                              disabled={item.quantity >= (ticket?.maxPerOrder || 10)}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => updateQuantity(item.ticketId, 0)}
                            className="p-2 sm:p-2.5 text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Group Booking Items */}
                {groupBookingItems.length > 0 && (
                  <div className="space-y-3 sm:space-y-4 mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Group Booking
                    </h4>
                    {groupBookingItems.map((item, index) => (
                      <div
                        key={`group-review-${index}`}
                        className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 glass-card rounded-xl sm:rounded-2xl bg-emerald-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{item.name}</h3>
                          <p className="text-base sm:text-lg font-bold text-gray-800 mt-2">
                            {formatPrice(item.price)} <span className="text-xs sm:text-sm font-normal text-gray-500">/ person</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{item.quantity} people</span>
                          </div>
                          <span className="text-lg font-bold text-emerald-700">{formatPrice(item.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href="/#tickets"
                  className="inline-flex items-center gap-2 mt-4 sm:mt-6 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-lg sm:rounded-xl transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  Add More Tickets
                </Link>
              </div>
            )}

            {/* Step 2: Customer Details */}
            {step === 2 && (
              <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Your Details</h2>
                    <p className="text-xs sm:text-sm text-gray-500">We&apos;ll send your tickets here</p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-14 sm:pl-[4.5rem] pr-3 sm:pr-4 py-3 sm:py-4 glass-card rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base ${
                          errors.name ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-300'
                        } focus:outline-none transition-colors text-gray-800`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={`w-full pl-14 sm:pl-[4.5rem] pr-3 sm:pr-4 py-3 sm:py-4 glass-card rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base ${
                          errors.email ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-300'
                        } focus:outline-none transition-colors text-gray-800`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {errors.email}
                      </p>
                    )}
                    <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Tickets will be sent to this email
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number"
                        className={`w-full pl-14 sm:pl-[4.5rem] pr-3 sm:pr-4 py-3 sm:py-4 glass-card rounded-xl sm:rounded-2xl border-2 text-sm sm:text-base ${
                          errors.phone ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-300'
                        } focus:outline-none transition-colors text-gray-800`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Secure Payment</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Pay via UPI, Cards, Net Banking or Wallets</p>
                  </div>
                </div>

                {/* Customer Summary */}
                <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{formData.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{formData.email}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right pl-13 sm:pl-0">
                      <p className="text-[10px] sm:text-xs text-gray-500">Phone</p>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">{formData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  {/* Amount to Pay */}
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Amount to Pay</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{formatPrice(totalAmount)}</p>
                  </div>

                  {/* Payment Methods */}
                  <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                      <span className="text-xs sm:text-sm text-gray-700">Cards</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                      <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="text-xs sm:text-sm text-gray-700">UPI</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="text-xs sm:text-sm text-gray-700">Net Banking</span>
                    </div>
                  </div>

                  <p className="text-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                    Choose your preferred payment method on the next screen
                  </p>

                  {/* Error Message */}
                  {paymentError && (
                    <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        <p className="text-xs sm:text-sm text-red-700">{paymentError}</p>
                      </div>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={handleInitiatePayment}
                    disabled={isProcessing || !isInstamojoLoaded}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm sm:text-base shadow-lg shadow-indigo-500/25"
                  >
                    {isProcessing ? (
                      <>
                        <LoaderSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : !isInstamojoLoaded ? (
                      <>
                        <LoaderSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Pay {formatPrice(totalAmount)}</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] sm:text-xs text-gray-500 text-center mt-3">
                    You will be redirected to a secure payment page
                  </p>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 text-sm sm:text-base">100% Secure Payment</p>
                    <p className="text-xs sm:text-sm text-green-600">Powered by Instamojo - India&apos;s trusted payment gateway</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <div className="glass-strong rounded-2xl sm:rounded-3xl overflow-hidden lg:sticky lg:top-8">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-3 sm:p-4 lg:p-5">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                  Order Summary
                </h3>
              </div>

              <div className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 lg:space-y-5">
                {/* Event Info */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <div className="glass-card rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 mx-auto mb-0.5 sm:mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium">31 Dec</p>
                  </div>
                  <div className="glass-card rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 mx-auto mb-0.5 sm:mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium">7:00 PM</p>
                  </div>
                  <div className="glass-card rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 mx-auto mb-0.5 sm:mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium truncate">Karjat</p>
                  </div>
                </div>

                {/* Order Items - Collapsible on mobile */}
                <div className="space-y-2 sm:space-y-3">
                  {booking.items.map((item) => (
                    <div key={item.ticketId} className="flex justify-between items-center p-2 sm:p-3 glass-card rounded-lg sm:rounded-xl">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item.ticketName}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">x {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  {groupBookingItems.map((item, index) => (
                    <div key={`group-sidebar-${index}`} className="flex justify-between items-center p-2 sm:p-3 glass-card rounded-lg sm:rounded-xl bg-emerald-50">
                      <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">x {item.quantity} @ {formatPrice(item.price)}</p>
                      </div>
                      <span className="font-semibold text-emerald-700 text-xs sm:text-sm flex-shrink-0">
                        {formatPrice(item.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1.5 sm:space-y-2 pt-3 sm:pt-4 border-t border-gray-200">
                  {subtotal > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Tickets</span>
                      <span className="text-gray-800 font-medium">{formatPrice(subtotal)}</span>
                    </div>
                  )}
                  {groupBookingTotal > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Group Booking</span>
                      <span className="text-emerald-700 font-medium">{formatPrice(groupBookingTotal)}</span>
                    </div>
                  )}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-green-800">{appliedCoupon.code}</p>
                          <p className="text-[10px] sm:text-xs text-green-600">-{formatPrice(couponDiscount)} off</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-green-600" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponError('');
                            }}
                            placeholder="Coupon code"
                            className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-300 text-gray-800 placeholder-gray-400"
                          />
                        </div>
                        <button
                          onClick={() => validateCoupon(couponCode)}
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="px-3 sm:px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {validatingCoupon ? (
                            <LoaderSpinner className="w-4 h-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      {couponError && (
                        <p className="mt-1.5 text-[10px] sm:text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Total with Discount */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-800 font-medium">{formatPrice(orderSubtotal)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-green-600">Discount</span>
                      <span className="text-green-600 font-medium">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800 text-sm sm:text-base">Total</span>
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                {step < 3 ? (
                  <button
                    onClick={handleContinue}
                    disabled={step === 1 && totalItems === 0 && !hasGroupBooking}
                    className="w-full py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {step === 1 ? 'Continue' : 'Continue to Payment'}
                  </button>
                ) : (
                  <button
                    onClick={handleInitiatePayment}
                    disabled={isProcessing || !isInstamojoLoaded}
                    className="w-full py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <>
                        <LoaderSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="text-sm sm:text-base">Processing...</span>
                      </>
                    ) : !isInstamojoLoaded ? (
                      <>
                        <LoaderSpinner className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="text-sm sm:text-base">Loading...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        Pay {formatPrice(totalAmount)}
                      </>
                    )}
                  </button>
                )}

                <p className="text-[10px] sm:text-xs text-gray-500 text-center flex items-center justify-center gap-1.5 sm:gap-2">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500" />
                  Secure checkout · Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10">
      <div className="max-w-md w-full glass-strong rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <LoaderSpinner className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1.5 sm:mb-2">Loading Checkout...</h1>
        <p className="text-sm sm:text-base text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}
