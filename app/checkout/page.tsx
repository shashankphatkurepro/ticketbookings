'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 as LoaderSpinner } from 'lucide-react';
import Link from 'next/link';
import { useBooking } from '../context/BookingContext';
import { eventData } from '../data/eventData';
import QRCode from 'qrcode';
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
  Smartphone,
  MessageCircle,
} from 'lucide-react';

// UPI Payment Configuration
const UPI_ID = 'paytmqr281005050101czmpb9rxhwvh@paytm';
const MERCHANT_NAME = 'Mangozzz Resort';
const WHATSAPP_NUMBER = '917977127312';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { booking, removeFromCart, addToCart, updateQuantity, getTotalAmount, getTotalItems, setCustomerInfo, clearCart, setPaymentComplete, getGroupBookingTotal, getGroupBookingItems } = useBooking();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [bookingId, setBookingId] = useState(() => `MNG${Date.now().toString(36).toUpperCase()}`);
  const [copied, setCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);
  const [upiQrCode, setUpiQrCode] = useState<string>('');
  const [formData, setFormData] = useState({
    name: booking.customerInfo.name,
    email: booking.customerInfo.email,
    phone: booking.customerInfo.phone,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle successful payment redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');

    if (success === 'true' && orderId) {
      setBookingId(orderId);
      setIsComplete(true);
    }
  }, [searchParams]);

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
  const totalAmount = subtotal + groupBookingTotal;
  const hasGroupBooking = groupBookingItems.length > 0;

  // Generate UPI QR code when reaching payment step
  useEffect(() => {
    if (step === 3 && totalAmount > 0) {
      generateUpiQrCode();
    }
  }, [step, totalAmount]);

  const generateUpiQrCode = async () => {
    // UPI deep link format
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Booking: ${bookingId}`)}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#1f2937', light: '#ffffff' }
      });
      setUpiQrCode(qrDataUrl);
    } catch (e) {
      console.log('UPI QR generation failed:', e);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  };

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

  const handlePaymentConfirmation = async () => {
    setIsProcessing(true);

    // Simulate a short delay for UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mark payment as complete in context
    setPaymentComplete(bookingId, `UPI-${Date.now()}`);

    setIsProcessing(false);
    setIsComplete(true);

    // Open WhatsApp to send payment screenshot
    openWhatsAppForScreenshot();
  };

  const openUpiApp = () => {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent(`Booking: ${bookingId}`)}`;
    window.location.href = upiUrl;
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

  // Success State
  if (isComplete) {
    return (
      <div className="min-h-screen px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="max-w-lg mx-auto">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block mb-4 sm:mb-6">
              <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 mx-auto" style={{ width: '4.5rem', height: '4.5rem' }}>
                <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
                <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Almost Done!</h1>
            <p className="text-sm sm:text-base text-gray-500">Send your payment screenshot to complete booking</p>
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

          {/* WhatsApp CTA */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">Send Payment Screenshot</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Click the button below to open WhatsApp and send your payment screenshot.
                Your tickets will be sent to you after verification.
              </p>
            </div>

            <button
              onClick={openWhatsAppForScreenshot}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg shadow-lg shadow-green-500/25 hover:shadow-green-500/35 transition-all hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Open WhatsApp
            </button>
          </div>

          {/* Steps Info */}
          <div className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              Next Steps
            </h3>
            <ol className="space-y-2.5 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">1</span>
                <p className="text-xs sm:text-sm text-gray-600">Open WhatsApp and send your payment screenshot</p>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">2</span>
                <p className="text-xs sm:text-sm text-gray-600">We will verify your payment</p>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">3</span>
                <p className="text-xs sm:text-sm text-gray-600">Your tickets will be sent to you on WhatsApp</p>
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
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 rounded-xl sm:rounded-2xl border border-amber-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 mb-0.5 sm:mb-1 text-sm sm:text-base">Important</p>
                <p className="text-xs sm:text-sm text-amber-700">
                  Please send your payment screenshot on WhatsApp for verification.
                  Tickets will be sent after payment confirmation.
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
                    <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Pay via UPI</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Scan QR or use UPI ID</p>
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

                {/* UPI Payment Section */}
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  {/* Amount to Pay */}
                  <div className="text-center mb-4 sm:mb-6">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Amount to Pay</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{formatPrice(totalAmount)}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                      {upiQrCode ? (
                        <img src={upiQrCode} alt="UPI QR Code" className="w-44 h-44 sm:w-56 sm:h-56" />
                      ) : (
                        <div className="w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center bg-gray-100 rounded-lg sm:rounded-xl">
                          <LoaderSpinner className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Scan this QR code with any UPI app
                  </p>

                  {/* UPI Apps Icons */}
                  <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    {/* Google Pay */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                      <img src="https://www.upi.me/_next/image?url=%2Flogos%2Fgpay.png&w=96&q=75" alt="Google Pay" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    </div>
                    {/* PhonePe */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                      <img src="https://www.upi.me/_next/image?url=%2Flogos%2Fphonepe.png&w=96&q=75" alt="PhonePe" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    </div>
                    {/* Paytm */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                      <img src="https://www.upi.me/_next/image?url=%2Flogos%2Fpaytm.png&w=96&q=75" alt="Paytm" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    </div>
                    {/* BHIM */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                      <img src="https://www.upi.me/_next/image?url=%2Flogos%2Fbhim.png&w=96&q=75" alt="BHIM" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-xs sm:text-sm text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* UPI ID */}
                  <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 text-center">Pay to UPI ID</p>
                    <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-md sm:rounded-lg p-2 sm:p-3">
                      <code className="text-[10px] sm:text-sm font-mono text-gray-800 truncate flex-1">{UPI_ID}</code>
                      <button
                        onClick={copyUpiId}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
                      >
                        {upiCopied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                        <span className="hidden xs:inline">{upiCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Open UPI App Button (Mobile) */}
                  <button
                    onClick={openUpiApp}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg sm:rounded-xl font-semibold flex items-center justify-center gap-2 transition-all mb-3 sm:mb-4 text-sm sm:text-base"
                  >
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                    Open UPI App to Pay
                  </button>

                  <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                    After payment, click the button below to confirm
                  </p>
                </div>

                {/* Instructions */}
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800 mb-1 text-sm sm:text-base">How to Pay</p>
                      <ol className="text-xs sm:text-sm text-blue-700 space-y-0.5 sm:space-y-1 list-decimal list-inside">
                        <li>Scan the QR code or copy the UPI ID</li>
                        <li>Pay {formatPrice(totalAmount)} using any UPI app</li>
                        <li>After successful payment, click &quot;I Have Paid&quot;</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800 text-sm sm:text-base">Secure UPI Payment</p>
                    <p className="text-xs sm:text-sm text-green-600">Direct bank transfer via UPI - no card details needed</p>
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

                {/* Total */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
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
                    onClick={handlePaymentConfirmation}
                    disabled={isProcessing}
                    className="w-full py-3 sm:py-3.5 lg:py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-semibold shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm sm:text-base">Confirming...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        I Have Paid
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
