'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { LogOut, User, ChevronDown, Menu } from 'lucide-react';

interface AdminHeaderProps {
  userEmail?: string;
  onMenuClick?: () => void;
}

export default function AdminHeader({ userEmail, onMenuClick }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 px-4 md:px-6 flex items-center justify-between">
      {/* Left side - Menu button and title */}
      <div className="flex items-center gap-3">
        {/* Hamburger menu - only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div>
          <h2 className="text-base md:text-lg font-semibold text-white">Welcome back</h2>
          <p className="text-xs md:text-sm text-gray-400 hidden sm:block">Manage your event bookings and tickets</p>
        </div>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-sm text-gray-300 hidden sm:inline">{userEmail || 'Admin'}</span>
          <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-20">
              {/* Show email on mobile in dropdown */}
              <div className="sm:hidden px-4 py-2 border-b border-gray-700">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm text-white truncate">{userEmail || 'Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
