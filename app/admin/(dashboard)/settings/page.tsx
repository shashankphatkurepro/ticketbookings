'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { LogOut, User, Shield, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your admin account</p>
      </div>

      {/* Account Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Account
          </h3>
        </div>
        <div className="p-5">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            Sign Out
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </h3>
        </div>
        <div className="p-5">
          <p className="text-gray-400 text-sm">
            To change your password or manage your account security, please use
            the Supabase dashboard.
          </p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3">About</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Mangozzz Admin Panel</p>
          <p>New Year Eve 2026 Ticket Management</p>
          <p className="text-gray-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
