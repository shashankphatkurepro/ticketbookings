'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';

interface WalkInFormData {
  name: string;
  email: string;
  phone: string;
  ticket_type: string;
  quantity: number;
  notes: string;
}

export default function AddWalkInPage() {
  const [formData, setFormData] = useState<WalkInFormData>({
    name: '',
    email: '',
    phone: '',
    ticket_type: 'general',
    quantity: 1,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const ticketTypes = [
    { value: 'general', label: 'General Pass' },
    { value: 'vip', label: 'VIP Pass' },
    { value: 'couple', label: 'Couple Pass' },
    { value: 'kids', label: 'Kids Pass' },
    { value: 'group', label: 'Group Pass' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Only allow digits for phone field
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value,
    }));
  };

  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      if (!formData.phone.trim() || !isValidPhone(formData.phone)) {
        setError('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }
      if (formData.quantity < 1) {
        setError('Quantity must be at least 1');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add walk-in entry');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        ticket_type: 'general',
        quantity: 1,
        notes: '',
      });

      // Reset success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Error adding walk-in:', err);
      setError('Failed to add walk-in entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/checked-in"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Walk-in Entry</h1>
          <p className="text-gray-400">Register a person entering without a booking</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-2xl">
        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <p className="text-green-400 font-medium">Walk-in entry added successfully!</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter person's name"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10 digit phone number"
                maxLength={10}
                className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  formData.phone && !isValidPhone(formData.phone)
                    ? 'border-yellow-500'
                    : formData.phone && isValidPhone(formData.phone)
                    ? 'border-green-500'
                    : 'border-gray-700'
                }`}
                required
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                formData.phone.length === 10 ? 'text-green-400' : 'text-gray-500'
              }`}>
                {formData.phone.length}/10
              </span>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Ticket Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Type *
            </label>
            <select
              name="ticket_type"
              value={formData.ticket_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {ticketTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Tickets *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-24 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="text-gray-400 text-sm">ticket(s)</p>
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Link
              href="/admin/checked-in"
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Walk-in Entry
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Note:</strong> Walk-in entries are immediately marked as checked-in and will appear in the checked-in users list.
        </p>
      </div>
    </div>
  );
}
