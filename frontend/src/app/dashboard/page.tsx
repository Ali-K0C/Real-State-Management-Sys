'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PropertyCard from '@/components/property/PropertyCard';
import CreatePropertyModal from '@/components/property/CreatePropertyModal';
import { api, ApiError } from '@/lib/api';
import { Property, PropertyStats, PaginatedResponse } from '@/types';
import { StatsCardSkeletonGrid } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, propertiesData] = await Promise.all([
        api.get<PropertyStats>('/properties/stats'),
        api.get<PaginatedResponse<Property>>('/properties?page=1&limit=8'),
      ]);

      setStats(statsData);
      setProperties(propertiesData.data);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCreateSuccess = () => {
    void fetchData();
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 animate-fade-in-down">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-500">Welcome back! Here&apos;s your real estate overview</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-8">
              <StatsCardSkeletonGrid count={2} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25 card-hover animate-fade-in-up stagger-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium mb-1">Total Properties</p>
                      <p className="text-4xl font-bold">{stats?.totalProperties || 0}</p>
                      <p className="text-emerald-100 text-sm mt-2">Available in the system</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/25 card-hover animate-fade-in-up stagger-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium mb-1">My Active Listings</p>
                      <p className="text-4xl font-bold">{stats?.myActiveListings || 0}</p>
                      <p className="text-green-100 text-sm mt-2">Your property listings</p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-border p-6 mb-8 shadow-sm animate-fade-in-up stagger-3">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link href="/properties">
                    <Button variant="outline" className="w-full h-12 border-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse Listings
                    </Button>
                  </Link>
                  <Link href="/my-listings">
                    <Button variant="outline" className="w-full h-12 border-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      My Listings
                    </Button>
                  </Link>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/25 btn-hover"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Property
                  </Button>
                </div>
              </div>

              <div className="animate-fade-in-up stagger-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
                  <Link href="/properties">
                    <Button variant="link" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      View All →
                    </Button>
                  </Link>
                </div>
                {properties.length === 0 ? (
                  <EmptyState
                    title="No properties available yet"
                    message="Be the first to list a property!"
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.map((property, index) => (
                      <div key={property.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}>
                        <PropertyCard property={property} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <CreatePropertyModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </AppLayout>
    </ProtectedRoute>
  );
}
