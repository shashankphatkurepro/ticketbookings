'use client';

import { useEffect, useCallback, useRef } from 'react';
import Script from 'next/script';

export interface InstamojoResponse {
  paymentId?: string;
  status?: string;
  paymentRequestId?: string;
}

interface InstamojoConfigOptions {
  directPaymentMode?: string;
  handlers?: {
    onOpen?: () => void;
    onClose?: () => void;
    onSuccess?: (response: InstamojoResponse) => void;
    onFailure?: (response: InstamojoResponse) => void;
  };
}

declare global {
  interface Window {
    Instamojo?: {
      configure: (options: InstamojoConfigOptions) => void;
      open: (url: string) => void;
      close: () => void;
    };
  }
}

interface InstamojoCheckoutProps {
  onSuccess: (response: InstamojoResponse) => void;
  onFailure: (response: InstamojoResponse) => void;
  onClose: () => void;
  onLoad?: () => void;
}

export function InstamojoCheckout({
  onSuccess,
  onFailure,
  onClose,
  onLoad,
}: InstamojoCheckoutProps) {
  const isConfiguredRef = useRef(false);

  const configureInstamojo = useCallback(() => {
    if (typeof window !== 'undefined' && window.Instamojo && !isConfiguredRef.current) {
      window.Instamojo.configure({
        handlers: {
          onOpen: () => {
            console.log('Instamojo checkout opened');
          },
          onClose: () => {
            console.log('Instamojo checkout closed');
            onClose();
          },
          onSuccess: (response: InstamojoResponse) => {
            console.log('Payment success:', response);
            onSuccess(response);
          },
          onFailure: (response: InstamojoResponse) => {
            console.log('Payment failed:', response);
            onFailure(response);
          },
        },
      });
      isConfiguredRef.current = true;
      onLoad?.();
    }
  }, [onSuccess, onFailure, onClose, onLoad]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.Instamojo) {
      configureInstamojo();
    }
  }, [configureInstamojo]);

  const handleScriptLoad = useCallback(() => {
    configureInstamojo();
  }, [configureInstamojo]);

  return (
    <Script
      src="https://js.instamojo.com/v1/checkout.js"
      onLoad={handleScriptLoad}
      strategy="lazyOnload"
    />
  );
}

export function openInstamojoCheckout(paymentUrl: string): boolean {
  if (typeof window !== 'undefined' && window.Instamojo) {
    window.Instamojo.open(paymentUrl);
    return true;
  }
  console.error('Instamojo not loaded');
  return false;
}

export function closeInstamojoCheckout(): void {
  if (typeof window !== 'undefined' && window.Instamojo) {
    window.Instamojo.close();
  }
}
