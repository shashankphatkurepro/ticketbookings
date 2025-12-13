'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/app/context/BookingContext';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Home,
} from 'lucide-react';

type PaymentState = 'PENDING' | 'COMPLETED' | 'FAILED' | 'loading' | 'error';

interface PaymentStatus {
  state: PaymentState;
  orderId?: string;
  amount?: number;
  errorMessage?: string;
}

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPaymentComplete } = useBooking();
  const [status, setStatus] = useState<PaymentStatus>({ state: 'loading' });
  const [pollCount, setPollCount] = useState(0);
  const maxPollAttempts = 10;

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setStatus({ state: 'error', errorMessage: 'Order ID not found' });
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/status?merchantOrderId=${orderId}`);
        const data = await response.json();

        if (data.success) {
          const paymentState = data.data.state as PaymentState;
          setStatus({
            state: paymentState,
            orderId: data.data.orderId,
            amount: data.data.amount,
          });

          if (paymentState === 'COMPLETED') {
            // Mark payment as complete in context
            setPaymentComplete(orderId, data.data.orderId);
            // Redirect to success page after a short delay
            setTimeout(() => {
              router.push(`/checkout?success=true&orderId=${orderId}`);
            }, 2000);
          } else if (paymentState === 'FAILED') {
            // Payment failed, stop polling
            return;
          } else if (paymentState === 'PENDING' && pollCount < maxPollAttempts) {
            // Continue polling for pending payments
            setPollCount((prev) => prev + 1);
            setTimeout(checkPaymentStatus, 3000);
          }
        } else {
          setStatus({ state: 'error', errorMessage: data.error });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus({ state: 'error', errorMessage: 'Failed to check payment status' });
      }
    };

    checkPaymentStatus();
  }, [orderId, pollCount, router, setPaymentComplete]);

  const handleRetry = () => {
    setPollCount(0);
    setStatus({ state: 'loading' });
  };

  const formatPrice = (paisa: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(paisa / 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full glass-strong rounded-3xl p-8 text-center">
        {/* Loading State */}
        {status.state === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h1>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>This may take a few seconds</span>
            </div>
          </>
        )}

        {/* Pending State */}
        {status.state === 'PENDING' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Pending</h1>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please don&apos;t close this page.
            </p>
            {pollCount >= maxPollAttempts && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Taking longer than expected? You can check again or contact support.
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check Again
                </button>
              </div>
            )}
          </>
        )}

        {/* Success State */}
        {status.state === 'COMPLETED' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-4">
              Your payment of {status.amount ? formatPrice(status.amount) : ''} has been received.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Redirecting to your tickets...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            </div>
          </>
        )}

        {/* Failed State */}
        {status.state === 'FAILED' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              Unfortunately, your payment could not be processed. Please try again.
            </p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Try Again
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 glass-card hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </>
        )}

        {/* Error State */}
        {status.state === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h1>
            <p className="text-gray-600 mb-6">
              {status.errorMessage || 'Unable to verify payment status. Please contact support.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full px-6 py-3 glass-card hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </>
        )}

        {/* Order ID Display */}
        {orderId && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">Order Reference</p>
            <p className="font-mono text-sm text-gray-700">{orderId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full glass-strong rounded-3xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentStatusContent />
    </Suspense>
  );
}
