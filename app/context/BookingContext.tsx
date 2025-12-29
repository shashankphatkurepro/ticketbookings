'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

interface GroupBooking {
  nonAlcoholCount: number;
  maleCount: number;
  femaleCount: number;
}

interface PaymentInfo {
  merchantOrderId: string | null;
  transactionId: string | null;
  status: 'idle' | 'pending' | 'completed' | 'failed';
}

interface BookingState {
  items: BookingItem[];
  groupBooking: GroupBooking;
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
  // Group booking functions
  setGroupBooking: (groupBooking: GroupBooking) => void;
  updateGroupCount: (type: 'nonAlcohol' | 'male' | 'female', count: number) => void;
  getGroupBookingTotal: () => number;
  getGroupBookingItems: () => { name: string; quantity: number; price: number; total: number }[];
}

const initialPaymentState: PaymentInfo = {
  merchantOrderId: null,
  transactionId: null,
  status: 'idle',
};

const initialGroupBooking: GroupBooking = {
  nonAlcoholCount: 0,
  maleCount: 0,
  femaleCount: 0,
};

// Group pricing functions
const getNonAlcoholPrice = (count: number) => {
  if (count >= 20) return 1199;
  if (count >= 10) return 1299;
  if (count >= 5) return 1399;
  return 1499;
};

const getMalePrice = (count: number) => {
  if (count >= 10) return 3299;
  if (count >= 5) return 3399;
  return 3499;
};

const getFemalePrice = (count: number) => {
  if (count >= 10) return 2799;
  if (count >= 5) return 2899;
  return 2999;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>({
    items: [],
    groupBooking: initialGroupBooking,
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
      groupBooking: initialGroupBooking,
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

  // Group booking functions
  const setGroupBooking = (groupBooking: GroupBooking) => {
    setBooking((prev) => ({ ...prev, groupBooking }));
  };

  const updateGroupCount = (type: 'nonAlcohol' | 'male' | 'female', count: number) => {
    setBooking((prev) => ({
      ...prev,
      groupBooking: {
        ...prev.groupBooking,
        [type === 'nonAlcohol' ? 'nonAlcoholCount' : type === 'male' ? 'maleCount' : 'femaleCount']: count,
      },
    }));
  };

  const getGroupBookingTotal = () => {
    const { nonAlcoholCount, maleCount, femaleCount } = booking.groupBooking;
    const nonAlcoholTotal = nonAlcoholCount * getNonAlcoholPrice(nonAlcoholCount);
    const maleTotal = maleCount * getMalePrice(maleCount);
    const femaleTotal = femaleCount * getFemalePrice(femaleCount);
    return nonAlcoholTotal + maleTotal + femaleTotal;
  };

  const getGroupBookingItems = () => {
    const items: { name: string; quantity: number; price: number; total: number }[] = [];
    const { nonAlcoholCount, maleCount, femaleCount } = booking.groupBooking;

    if (nonAlcoholCount > 0) {
      const price = getNonAlcoholPrice(nonAlcoholCount);
      items.push({
        name: 'Group - Without Alcohol',
        quantity: nonAlcoholCount,
        price,
        total: nonAlcoholCount * price,
      });
    }

    if (maleCount > 0) {
      const price = getMalePrice(maleCount);
      items.push({
        name: 'Group - Male (with drinks)',
        quantity: maleCount,
        price,
        total: maleCount * price,
      });
    }

    if (femaleCount > 0) {
      const price = getFemalePrice(femaleCount);
      items.push({
        name: 'Group - Female (with drinks)',
        quantity: femaleCount,
        price,
        total: femaleCount * price,
      });
    }

    return items;
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
        setGroupBooking,
        updateGroupCount,
        getGroupBookingTotal,
        getGroupBookingItems,
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
