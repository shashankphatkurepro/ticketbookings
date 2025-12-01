'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface BookingItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

interface BookingState {
  items: BookingItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
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
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>({
    items: [],
    customerInfo: { name: '', email: '', phone: '' },
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
    setBooking((prev) => ({ ...prev, items: [] }));
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
