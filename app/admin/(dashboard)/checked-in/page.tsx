'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronLeft, ChevronRight, User, Clock, UserPlus } from 'lucide-react';

interface CheckedInTicket {
  id: string;
  ticket_id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  ticket_type: string;
  attendee_number: number;
  used_at: string;
  used_by?: string;
  source?: string;
}

export default function CheckedInUsersPage() {
  const [checkedInTickets, setCheckedInTickets] = useState<CheckedInTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCheckedInTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });
      if (search) params.set('search', search);

      const response = await fetch(`/api/tickets/checked-in?${params}`);
      const data = await response.json();

      setCheckedInTickets(data.tickets || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch checked-in tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCheckedInTickets();
  }, [fetchCheckedInTickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCheckedInTickets();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Checked-in Users</h1>
          <p className="text-gray-400 mt-1">{total} users checked in</p>
        </div>
        <Link
          href="/admin/checked-in/add-walk-in"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Walk-in
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, or ticket ID..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : checkedInTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No checked-in users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Ticket Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Attendee #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Checked-in At
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Checked-in By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {checkedInTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm text-purple-400">
                          {ticket.ticket_id}
                        </p>
                        {ticket.source === 'walk-in' && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                            Walk-in
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-800 rounded-lg">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="font-medium text-white">
                          {ticket.customer_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400">{ticket.customer_email}</p>
                        <p className="text-sm text-gray-400">{ticket.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        {ticket.ticket_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">
                        #{ticket.attendee_number}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(ticket.used_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-400">
                        {ticket.used_by || 'System'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
