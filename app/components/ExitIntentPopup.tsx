'use client';

import { useState, useEffect } from 'react';
import { X, Ticket, Clock, Gift } from 'lucide-react';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShow(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShow(false)}
      />

      {/* Popup */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wait! Don&apos;t Miss Out!</h2>
          <p className="text-white/90">New Year&apos;s Eve 2026 is almost sold out</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Limited tickets remaining!</span> Over 2,500 people are interested.
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </span>
              Unlimited Food & Drinks
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </span>
              Live DJ & Entertainment
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500" />
              </span>
              Midnight Fireworks Show
            </li>
          </ul>

          <a
            href="#tickets"
            onClick={() => setShow(false)}
            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all"
          >
            <Ticket className="w-5 h-5" />
            Book Your Tickets Now
          </a>

          <p className="text-center text-gray-500 text-sm mt-4">
            Secure your spot before it&apos;s too late!
          </p>
        </div>
      </div>
    </div>
  );
}
