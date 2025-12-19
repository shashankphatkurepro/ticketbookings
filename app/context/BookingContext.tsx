'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

interface PaymentInfo {
  merchantOrderId: string | null;
  transactionId: string | null;
  status: 'idle' | 'pending' | 'completed' | 'failed';
}

interface BookingState {
  items: BookingItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  payment: PaymentInfo;
}

interface BookingContextType {
  booking: BookingState;
  addToCart: (ticketId: string, ticketName: string, price: number) => void;
  removeFromCart: (ticketId: string) => void;
  updateQuantity: (ticketId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  setCustomerInfo: (info: { name: string; email: string; phone: string }) => void;
  setPaymentPending: (merchantOrderId: string) => void;
  setPaymentComplete: (merchantOrderId: string, transactionId: string) => void;
  setPaymentFailed: () => void;
  resetPayment: () => void;
}

const initialPaymentState: PaymentInfo = {
  merchantOrderId: null,
  transactionId: null,
  status: 'idle',
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>({
    items: [],
    customerInfo: { name: '', email: '', phone: '' },
    payment: initialPaymentState,
  });

  const addToCart = (ticketId: string, ticketName: string, price: number) => {
    setBooking((prev) => {
      const existingItem = prev.items.find((item) => item.ticketId === ticketId);

      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.ticketId === ticketId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        ...prev,
        items: [...prev.items, { ticketId, ticketName, price, quantity: 1 }],
      };
    });
  };

  const removeFromCart = (ticketId: string) => {
    setBooking((prev) => {
      const existingItem = prev.items.find((item) => item.ticketId === ticketId);

      if (existingItem && existingItem.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.ticketId === ticketId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        };
      }

      return {
        ...prev,
        items: prev.items.filter((item) => item.ticketId !== ticketId),
      };
    });
  };

  const updateQuantity = (ticketId: string, quantity: number) => {
    if (quantity <= 0) {
      setBooking((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.ticketId !== ticketId),
      }));
      return;
    }

    setBooking((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.ticketId === ticketId ? { ...item, quantity } : item
      ),
    }));
  };

  const clearCart = () => {
    setBooking((prev) => ({
      ...prev,
      items: [],
      payment: initialPaymentState,
    }));
  };

  const getTotalAmount = () => {
    return booking.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return booking.items.reduce((total, item) => total + item.quantity, 0);
  };

  const setCustomerInfo = (info: { name: string; email: string; phone: string }) => {
    setBooking((prev) => ({ ...prev, customerInfo: info }));
  };

  const setPaymentPending = (merchantOrderId: string) => {
    setBooking((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        merchantOrderId,
        status: 'pending',
      },
    }));
  };

  const setPaymentComplete = (merchantOrderId: string, transactionId: string) => {
    setBooking((prev) => ({
      ...prev,
      payment: {
        merchantOrderId,
        transactionId,
        status: 'completed',
      },
    }));
  };

  const setPaymentFailed = () => {
    setBooking((prev) => ({
      ...prev,
      payment: {
        ...prev.payment,
        status: 'failed',
      },
    }));
  };

  const resetPayment = () => {
    setBooking((prev) => ({
      ...prev,
      payment: initialPaymentState,
    }));
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalAmount,
        getTotalItems,
        setCustomerInfo,
        setPaymentPending,
        setPaymentComplete,
        setPaymentFailed,
        resetPayment,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
