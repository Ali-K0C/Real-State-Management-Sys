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
import type { RentalListing } from '@/types';

interface RentConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: RentalListing;
  onSuccess?: () => void;
}

export default function RentConfirmDialog({
  isOpen,
  onClose,
  listing,
  onSuccess,
}: RentConfirmDialogProps) {
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState(listing.leaseDuration || 12);
  const [paymentDay, setPaymentDay] = useState(1);
  const [notes, setNotes] = useState('');

  // Calculate end date based on start date and duration
  const calculateEndDate = (start: string, months: number): string => {
    if (!start) return '';
    const date = new Date(start);
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endDate = calculateEndDate(startDate, durationMonths);

      await rentalApi.createLease({
        rentalListingId: listing.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        paymentDay,
        notes: notes || undefined,
      });

      setStep('success');
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lease request';
      setError(errorMessage);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setError(null);
    setStartDate('');
    setDurationMonths(listing.leaseDuration || 12);
    setPaymentDay(1);
    setNotes('');
    onClose();
  };

  const property = listing.property;

  // Get minimum start date (today or availableFrom, whichever is later)
  const today = new Date().toISOString().split('T')[0];
  const availableFrom = listing.availableFrom ? new Date(listing.availableFrom).toISOString().split('T')[0] : today;
  const minStartDate = availableFrom > today ? availableFrom : today;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rent This Property</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {step === 'success' ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Lease Request Submitted!</p>
                <p className="text-sm">The landlord will review and activate your lease.</p>
              </div>
            </div>
          ) : step === 'error' ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">Failed to submit lease request</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Summary */}
              {property && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Property Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property:</span>
                      <span className="font-medium text-gray-900">{property.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-gray-900">{property.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Rent:</span>
                      <span className="font-bold text-blue-600">
                        ${Number(listing.monthlyRent).toLocaleString()} / month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-medium text-gray-900">
                        ${Number(listing.securityDeposit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lease Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    required
                    min={minStartDate}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Lease Duration (months)
                  </label>
                  <select
                    id="duration"
                    required
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                    <option value={18}>18 months</option>
                    <option value={24}>24 months</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Day of Month
                  </label>
                  <select
                    id="paymentDay"
                    required
                    value={paymentDay}
                    onChange={(e) => setPaymentDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Rent will be due on this day each month
                  </p>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional notes or special requests..."
                  />
                </div>

                {startDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Lease Period:</span>{' '}
                      {new Date(startDate).toLocaleDateString()} -{' '}
                      {new Date(calculateEndDate(startDate, durationMonths)).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            {step === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {step === 'form' && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !startDate}
            >
              {loading ? 'Submitting...' : 'Submit Lease Request'}
            </Button>
          )}
          {step === 'error' && (
            <Button
              type="button"
              onClick={() => setStep('form')}
            >
              Try Again
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
