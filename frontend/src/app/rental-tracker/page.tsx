'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { rentalApi } from '@/lib/rental-api';
import { useRouter } from 'next/navigation';
import type { LandlordStats } from '@/types';

export default function RentalTrackerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<LandlordStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await rentalApi.getLandlordStats();
      setStats(data);
    } catch (err: unknown) {
      const fetchError = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rental Tracker Dashboard
            </h1>
            <p className="text-gray-600">
              Manage your rental properties and track lease status
            </p>
          </div>

          {/* Quick Nav */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => router.push('/rental-tracker')}
              className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/rental-tracker/properties')}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Properties
            </button>
            <button
              onClick={() => router.push('/rental-tracker/leases')}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Leases
            </button>
            <button
              onClick={() => router.push('/rental-tracker/maintenance')}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Maintenance
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading statistics...</p>
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Total Properties
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalRentalProperties}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Occupied
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.occupiedProperties}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.vacantProperties} vacant
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Active Leases
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.activeLeases}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.pendingLeases} pending
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Overdue Payments
                  </h3>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.overduePaymentsCount}
                  </p>
                </div>
              </div>

              {/* Upcoming Payments */}
              {stats.upcomingDue && stats.upcomingDue.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upcoming Rent Payments (Next 7 Days)
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {stats.upcomingDue.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex justify-between items-center p-4 bg-amber-50 border border-amber-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.lease?.tenant?.firstName}{' '}
                              {payment.lease?.tenant?.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {payment.lease?.rentalListing?.property?.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              ${payment.amount.toLocaleString()}
                            </p>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded">
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Locations */}
              {stats.topLocations && stats.topLocations.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Properties by Location
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {stats.topLocations.map((loc, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-gray-900">{loc.location}</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {loc.count} {loc.count === 1 ? 'property' : 'properties'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No statistics available</p>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
