'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { rentalApi } from '@/lib/rental-api';
import type { RentPayment, RentPaymentStatus, PaymentMethod } from '@/types';

interface PaymentTableProps {
  payments: RentPayment[];
  isLandlord: boolean;
  onPaymentUpdated?: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH' as PaymentMethod, label: 'Cash' },
  { value: 'BANK_TRANSFER' as PaymentMethod, label: 'Bank Transfer' },
  { value: 'CREDIT_CARD' as PaymentMethod, label: 'Credit Card' },
  { value: 'DEBIT_CARD' as PaymentMethod, label: 'Debit Card' },
  { value: 'CHECK' as PaymentMethod, label: 'Check' },
  { value: 'OTHER' as PaymentMethod, label: 'Other' },
];

export default function PaymentTable({
  payments,
  isLandlord,
  onPaymentUpdated,
}: PaymentTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER' as PaymentMethod);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecordPayment = async () => {
    if (!selectedPayment) return;
    setLoading(true);
    setError(null);

    try {
      await rentalApi.recordPayment(selectedPayment.id, {
        paymentMethod,
        notes: notes || undefined,
      });
      setShowRecordModal(false);
      setSelectedPayment(null);
      setNotes('');
      onPaymentUpdated?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record payment';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openRecordModal = (payment: RentPayment) => {
    setSelectedPayment(payment);
    setPaymentMethod('BANK_TRANSFER' as PaymentMethod);
    setNotes('');
    setError(null);
    setShowRecordModal(true);
  };

  const getStatusBadgeClass = (status: RentPaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'DUE':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'WAIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              {isLandlord && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(payment.dueDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${Number(payment.amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {payment.paidDate
                    ? new Date(payment.paidDate).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {payment.paymentMethod
                    ? payment.paymentMethod.replace('_', ' ')
                    : '-'}
                </td>
                {isLandlord && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {(payment.status === 'DUE' || payment.status === 'OVERDUE') && (
                      <button
                        onClick={() => openRecordModal(payment)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      <Dialog open={showRecordModal} onOpenChange={setShowRecordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {selectedPayment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedPayment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">
                      ${Number(selectedPayment.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any notes about this payment..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRecordModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRecordPayment}
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
