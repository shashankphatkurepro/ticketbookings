'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Phone,
  User,
  IndianRupee,
  Ticket,
  UserCheck,
  Loader2,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  amount_paid: number;
  total_amount: number;
  payment_status: 'paid' | 'half_paid' | 'not_paid';
  has_ticket: boolean;
  is_booked: boolean;
  notes: string;
  created_at: string;
}

type PaymentStatus = 'paid' | 'half_paid' | 'not_paid';

const STORAGE_KEY = 'customer_support_list';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'all'>('all');

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    amount_paid: 0,
    total_amount: 0,
    payment_status: 'not_paid' as PaymentStatus,
    has_ticket: false,
    is_booked: false,
    notes: '',
  });

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomers(JSON.parse(stored));
      } catch {
        setCustomers([]);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever customers change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }
  }, [customers, loading]);

  // Check booking status from database
  const checkBookingStatus = async (phone: string): Promise<{ isBooked: boolean; hasTicket: boolean }> => {
    try {
      const response = await fetch(`/api/bookings/check?phone=${encodeURIComponent(phone)}`);
      if (response.ok) {
        const data = await response.json();
        return { isBooked: data.isBooked || false, hasTicket: data.hasTicket || false };
      }
    } catch (error) {
      console.error('Failed to check booking status:', error);
    }
    return { isBooked: false, hasTicket: false };
  };

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      amount_paid: 0,
      total_amount: 0,
      payment_status: 'not_paid',
      has_ticket: false,
      is_booked: false,
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      amount_paid: customer.amount_paid,
      total_amount: customer.total_amount,
      payment_status: customer.payment_status,
      has_ticket: customer.has_ticket,
      is_booked: customer.is_booked,
      notes: customer.notes,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;

    // Check database for booking/ticket status
    const dbStatus = await checkBookingStatus(formData.phone);

    const customerData: Customer = {
      id: editingCustomer?.id || crypto.randomUUID(),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      amount_paid: formData.amount_paid,
      total_amount: formData.total_amount,
      payment_status: formData.payment_status,
      has_ticket: dbStatus.hasTicket || formData.has_ticket,
      is_booked: dbStatus.isBooked || formData.is_booked,
      notes: formData.notes.trim(),
      created_at: editingCustomer?.created_at || new Date().toISOString(),
    };

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === editingCustomer.id ? customerData : c))
      );
    } else {
      setCustomers((prev) => [customerData, ...prev]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setDeleteId(null);
  };

  const refreshBookingStatus = async (customer: Customer) => {
    const dbStatus = await checkBookingStatus(customer.phone);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? { ...c, is_booked: dbStatus.isBooked, has_ticket: dbStatus.hasTicket }
          : c
      )
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      half_paid: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      not_paid: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const labels = {
      paid: 'Paid',
      half_paid: 'Half Paid',
      not_paid: 'Not Paid',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || customer.payment_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Support List</h1>
          <p className="text-gray-400 mt-1">Manage customers and track payment status</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | 'all')}
          className="px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="half_paid">Half Paid</option>
          <option value="not_paid">Not Paid</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-white">{customers.length}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Paid</p>
          <p className="text-2xl font-bold text-green-400">
            {customers.filter((c) => c.payment_status === 'paid').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Half Paid</p>
          <p className="text-2xl font-bold text-yellow-400">
            {customers.filter((c) => c.payment_status === 'half_paid').length}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-400">Not Paid</p>
          <p className="text-2xl font-bold text-red-400">
            {customers.filter((c) => c.payment_status === 'not_paid').length}
          </p>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {customers.length === 0
              ? 'No customers yet. Click "Add Customer" to get started.'
              : 'No customers match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Customer</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Phone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-400">Ticket</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-400">Booked</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          {customer.notes && (
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{customer.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone className="w-3 h-3 text-gray-500" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-white">
                        <IndianRupee className="w-3 h-3 text-gray-500" />
                        <span className="font-medium">{customer.amount_paid.toLocaleString()}</span>
                        {customer.total_amount > 0 && (
                          <span className="text-gray-500">/ {customer.total_amount.toLocaleString()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getPaymentStatusBadge(customer.payment_status)}</td>
                    <td className="px-4 py-3 text-center">
                      {customer.has_ticket ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500/20 rounded-full">
                          <Ticket className="w-3 h-3 text-green-400" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-700/50 rounded-full">
                          <X className="w-3 h-3 text-gray-500" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {customer.is_booked ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500/20 rounded-full">
                          <UserCheck className="w-3 h-3 text-green-400" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-700/50 rounded-full">
                          <X className="w-3 h-3 text-gray-500" />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => refreshBookingStatus(customer)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Refresh from database"
                        >
                          <Loader2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(customer.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Amount Paid</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amount_paid || ''}
                    onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Total Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_amount || ''}
                    onChange={(e) => setFormData({ ...formData, total_amount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Status</label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value as PaymentStatus })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="not_paid">Not Paid</option>
                  <option value="half_paid">Half Paid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_ticket}
                    onChange={(e) => setFormData({ ...formData, has_ticket: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">Has Ticket</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_booked}
                    onChange={(e) => setFormData({ ...formData, is_booked: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">Is Booked</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Any notes..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name.trim() || !formData.phone.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingCustomer ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Customer?</h3>
            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
