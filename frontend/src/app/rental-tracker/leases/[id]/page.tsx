'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PaymentTable from '@/components/rental-tracker/PaymentTable';
import { rentalApi } from '@/lib/rental-api';
import { useUser } from '@/context/UserContext';
import type { RentalLease, RentalLeaseStatus } from '@/types';

export default function LeaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const id = params?.id as string;

  const [lease, setLease] = useState<RentalLease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const fetchLease = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      const data = await rentalApi.getLease(id);
      setLease(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load lease';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLease();
  }, [fetchLease]);

  const handleActivateLease = async () => {
    if (!lease) return;
    setActivating(true);

    try {
      await rentalApi.updateLeaseStatus(lease.id, 'ACTIVE' as RentalLeaseStatus);
      await fetchLease(); // Refresh
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate lease';
      setError(errorMessage);
    } finally {
      setActivating(false);
    }
  };

  const isLandlord = user && lease && user.id === lease.landlordId;
  const canActivate = isLandlord && lease?.status === 'PENDING';

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'TERMINATED':
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading lease details...</p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (error || !lease) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error || 'Lease not found'}
            </div>
            <button
              onClick={() => router.push('/rental-tracker/leases')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Leases
            </button>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const property = lease.rentalListing?.property;
  const stats = lease.paymentStats;

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/rental-tracker/leases')}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Leases
          </button>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {property?.title || 'Lease Details'}
                </h1>
                <p className="text-gray-600">
                  {property?.location} • {property?.address}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(lease.status)}`}>
                {lease.status}
              </span>
            </div>

            {canActivate && (
              <div className="mt-4">
                <button
                  onClick={handleActivateLease}
                  disabled={activating}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {activating ? 'Activating...' : 'Activate Lease'}
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Activating the lease will generate the payment schedule and mark the property as rented.
                </p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.totalPaid.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{stats.paidCount} payments</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total Due</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${stats.totalDue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{stats.dueCount} payments</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.totalOverdue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{stats.overdueCount} payments</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPayments}
                </p>
                <p className="text-xs text-gray-500">scheduled</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lease Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Lease Period</p>
                    <p className="font-medium text-gray-900">
                      {new Date(lease.startDate).toLocaleDateString()} -{' '}
                      {new Date(lease.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="font-medium text-gray-900">
                      ${Number(lease.monthlyRent).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Security Deposit</p>
                    <p className="font-medium text-gray-900">
                      ${Number(lease.securityDeposit).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Day</p>
                    <p className="font-medium text-gray-900">Day {lease.paymentDay} of each month</p>
                  </div>
                  {lease.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-gray-900">{lease.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tenant Information */}
              {lease.tenant && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{lease.tenant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{lease.tenant.contactNo}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Landlord Information (for tenants) */}
              {lease.landlord && !isLandlord && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Landlord Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900">
                        {lease.landlord.firstName} {lease.landlord.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{lease.landlord.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium text-gray-900">{lease.landlord.contactNo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Schedule */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h2>
                {lease.payments && lease.payments.length > 0 ? (
                  <PaymentTable
                    payments={lease.payments}
                    isLandlord={isLandlord || false}
                    onPaymentUpdated={fetchLease}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {lease.status === 'PENDING' ? (
                      <p>Payment schedule will be generated when the lease is activated.</p>
                    ) : (
                      <p>No payments scheduled.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
