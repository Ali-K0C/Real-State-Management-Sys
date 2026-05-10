'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { StatsCardSkeletonGrid } from '@/components/ui/Skeleton';
import { rentalApi } from '@/lib/rental-api';
import type { LandlordStats } from '@/types';

const navItems = [
  { label: 'Dashboard', href: '/rental-tracker', active: true },
  { label: 'Properties', href: '/rental-tracker/properties', active: false },
  { label: 'Leases', href: '/rental-tracker/leases', active: false },
  { label: 'Maintenance', href: '/rental-tracker/maintenance', active: false },
];

export default function RentalTrackerDashboard() {
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
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-3xl font-bold text-gray-900">
              Rental Tracker
            </h1>
            <p className="mt-2 text-gray-500">
              Manage your rental properties and track lease status
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all btn-hover ${
                  item.active
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          {loading ? (
            <StatsCardSkeletonGrid count={4} />
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25 card-hover animate-fade-in-up stagger-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium mb-1">Total Properties</p>
                      <p className="text-4xl font-bold">{stats.totalRentalProperties}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25 card-hover animate-fade-in-up stagger-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium mb-1">Occupied</p>
                      <p className="text-4xl font-bold">{stats.occupiedProperties}</p>
                      <p className="text-emerald-100 text-sm mt-1">{stats.vacantProperties} vacant</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25 card-hover animate-fade-in-up stagger-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-violet-100 text-sm font-medium mb-1">Active Leases</p>
                      <p className="text-4xl font-bold">{stats.activeLeases}</p>
                      <p className="text-violet-100 text-sm mt-1">{stats.pendingLeases} pending</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl p-6 text-white shadow-lg card-hover animate-fade-in-up stagger-4 ${
                  stats.overduePaymentsCount > 0 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25' 
                    : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/25'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium mb-1">Overdue Payments</p>
                      <p className="text-4xl font-bold">{stats.overduePaymentsCount}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {stats.upcomingDue && stats.upcomingDue.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-8 animate-fade-in-up stagger-5">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Upcoming Rent Payments (Next 7 Days)
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {stats.upcomingDue.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex justify-between items-center p-4 bg-amber-50/50 border border-amber-100 rounded-xl"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {payment.lease?.tenant?.firstName}{' '}
                              {payment.lease?.tenant?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.lease?.rentalListing?.property?.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Due: {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900">
                              Rs {Number(payment.amount).toLocaleString()}
                            </p>
                            <span className="inline-block px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {stats.topLocations && stats.topLocations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in-up stagger-6">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Properties by Location
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {stats.topLocations.map((loc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <span className="text-gray-700 font-medium">{loc.location}</span>
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
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
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">No statistics available</p>
              <p className="text-sm text-gray-400 mt-1">Start adding rental properties to see your stats</p>
            </div>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
