'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, Loader2, QrCode } from 'lucide-react';

interface TicketVerification {
  valid: boolean;
  ticket_id?: string;
  ticket_type?: string;
  attendee_number?: number;
  booking_id?: string;
  guest_name?: string;
  used_at?: string;
  message: string;
}

export default function TicketsPage() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketVerification | null>(null);
  const [markingUsed, setMarkingUsed] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/tickets/${ticketId.trim()}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Failed to verify ticket:', error);
      setResult({
        valid: false,
        message: 'Failed to verify ticket. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUsed = async () => {
    if (!result?.ticket_id) return;

    setMarkingUsed(true);
    try {
      const response = await fetch(`/api/tickets/${result.ticket_id}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedBy: 'admin' }),
      });

      if (response.ok) {
        setResult({
          ...result,
          valid: false,
          message: 'Ticket has been marked as used.',
        });
      }
    } catch (error) {
      console.error('Failed to mark ticket as used:', error);
    } finally {
      setMarkingUsed(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Ticket Verification</h1>
        <p className="text-gray-400 mt-1">
          Scan or enter a ticket ID to verify entry
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              placeholder="Enter Ticket ID (e.g., TKT-ABC12345)"
              className="w-full pl-14 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !ticketId.trim()}
            className="w-full py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Verify Ticket
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl p-6 border ${
            result.valid
              ? 'bg-green-900/20 border-green-800'
              : 'bg-red-900/20 border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            {result.valid ? (
              <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3
                className={`text-xl font-bold ${
                  result.valid ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {result.valid ? 'Valid Ticket' : 'Invalid Ticket'}
              </h3>
              <p className="text-gray-300 mt-1">{result.message}</p>

              {result.valid && (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Ticket ID</p>
                      <p className="text-white font-mono">{result.ticket_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Booking ID</p>
                      <p className="text-white font-mono">{result.booking_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Ticket Type</p>
                      <p className="text-white">{result.ticket_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Attendee #</p>
                      <p className="text-white">{result.attendee_number}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Guest Name</p>
                    <p className="text-white text-lg font-medium">{result.guest_name}</p>
                  </div>

                  <button
                    onClick={handleMarkUsed}
                    disabled={markingUsed}
                    className="w-full mt-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {markingUsed ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Allow Entry & Mark Used
                      </>
                    )}
                  </button>
                </div>
              )}

              {result.used_at && (
                <p className="text-sm text-gray-400 mt-2">
                  Used at: {new Date(result.used_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3">Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li>1. Scan the QR code on the ticket or enter the ticket ID manually</li>
          <li>2. Verify the ticket is valid and the guest name matches</li>
          <li>3. Click &quot;Allow Entry & Mark Used&quot; to register entry</li>
          <li>4. Each ticket can only be used once</li>
        </ul>
      </div>
    </div>
  );
}
