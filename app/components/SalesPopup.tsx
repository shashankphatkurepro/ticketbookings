'use client';

import { useState, useEffect } from 'react';
import { X, Ticket } from 'lucide-react';

const indianNames = [
  'Aarav Sharma',
  'Priya Patel',
  'Rohan Mehta',
  'Ananya Singh',
  'Vikram Reddy',
  'Sneha Gupta',
  'Arjun Nair',
  'Kavya Iyer',
  'Rahul Verma',
  'Pooja Desai',
  'Aditya Joshi',
  'Neha Kulkarni',
  'Karan Malhotra',
  'Divya Rao',
  'Siddharth Pillai',
  'Meera Kapoor',
  'Amit Thakur',
  'Riya Agarwal',
  'Nikhil Saxena',
  'Anjali Menon',
  'Varun Chauhan',
  'Swati Bose',
  'Akash Shetty',
  'Tanvi Pandey',
  'Harsh Choudhary',
  'Shruti Mishra',
  'Manish Tiwari',
  'Ishita Banerjee',
  'Gaurav Yadav',
  'Nidhi Rawat',
];

const ticketTypes = [
  'Couple with Food',
  'Stag with Food',
  'Couple Food + Cool Drinks',
  'Stag with Food and Drinks',
  'Kids 5–10 Years Pass',
  'Kids 10 to 15',
];

const cities = [
  'Mumbai',
  'Pune',
  'Navi Mumbai',
  'Thane',
  'Nashik',
  'Kolhapur',
  'Nagpur',
  'Aurangabad',
];

const timeAgo = [
  '2 minutes ago',
  '5 minutes ago',
  '8 minutes ago',
  '12 minutes ago',
  '15 minutes ago',
  '20 minutes ago',
  '25 minutes ago',
  '30 minutes ago',
];

export default function SalesPopup() {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState({
    name: '',
    ticket: '',
    city: '',
    time: '',
  });

  useEffect(() => {
    // Only show on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return;
    }

    const showNotification = () => {
      const randomName = indianNames[Math.floor(Math.random() * indianNames.length)];
      const randomTicket = ticketTypes[Math.floor(Math.random() * ticketTypes.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomTime = timeAgo[Math.floor(Math.random() * timeAgo.length)];

      setNotification({
        name: randomName,
        ticket: randomTicket,
        city: randomCity,
        time: randomTime,
      });
      setShow(true);

      // Hide after 5 seconds
      setTimeout(() => setShow(false), 5000);
    };

    // Show first notification after 10 seconds
    const initialTimeout = setTimeout(showNotification, 10000);

    // Show subsequent notifications every 15-25 seconds
    const interval = setInterval(() => {
      const randomDelay = Math.floor(Math.random() * 10000) + 15000;
      setTimeout(showNotification, randomDelay);
    }, 25000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 hidden lg:block animate-in slide-in-from-left duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-sm">
        <button
          onClick={() => setShow(false)}
          className="absolute -top-2 -right-2 p-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Ticket className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-semibold">{notification.name}</span> from{' '}
              <span className="font-medium">{notification.city}</span> just booked
            </p>
            <p className="text-sm font-semibold text-purple-600 truncate">
              {notification.ticket}
            </p>
            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs text-gray-600">
              <span className="font-medium">{Math.floor(Math.random() * 20) + 20}</span> people viewing this event
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
