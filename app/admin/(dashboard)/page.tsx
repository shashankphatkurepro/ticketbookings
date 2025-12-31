'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  CalendarCheck,
  Clock,
  Ticket,
  CheckCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  refundedBookings: number;
  totalRevenue: number;
  ticketsGenerated: number;
  ticketsUsed: number;
}

interface RecentBooking {
  id: string;
  booking_id: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: stats ? `₹${stats.totalRevenue.toLocaleString()}` : '—',
      icon: DollarSign,
      color: 'from-green-600 to-emerald-600',
    },
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarCheck,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      label: 'Confirmed',
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle,
      color: 'from-purple-600 to-pink-600',
    },
    {
      label: 'Pending',
      value: stats?.pendingBookings || 0,
      icon: Clock,
      color: 'from-yellow-600 to-orange-600',
    },
    {
      label: 'Tickets Generated',
      value: stats?.ticketsGenerated || 0,
      icon: Ticket,
      color: 'from-indigo-600 to-violet-600',
    },
    {
      label: 'Tickets Used',
      value: stats?.ticketsUsed || 0,
      icon: TrendingUp,
      color: 'from-teal-600 to-cyan-600',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-green-500/20 text-green-400',
      refunded: 'bg-red-500/20 text-red-400',
      failed: 'bg-gray-500/20 text-gray-400',
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/bookings"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">View All Bookings</h3>
              <p className="text-sm text-gray-400 mt-1">
                Manage and confirm payments
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </Link>

        <Link
          href="/admin/tickets"
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Ticket Management</h3>
              <p className="text-sm text-gray-400 mt-1">
                Generate and verify tickets
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="p-4 md:p-5 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">Recent Bookings</h3>
          <Link
            href="/admin/bookings"
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No bookings yet
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-800/50 transition-colors gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{booking.customer_name}</p>
                    <p className="text-sm text-gray-400 font-mono">{booking.booking_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      booking.payment_status
                    )}`}
                  >
                    {booking.payment_status}
                  </span>
                  <span className="font-medium text-white">
                    ₹{booking.total_amount.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
