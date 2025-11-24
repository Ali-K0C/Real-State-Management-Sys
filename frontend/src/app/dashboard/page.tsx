'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PropertyCard from '@/components/property/PropertyCard';
import CreatePropertyModal from '@/components/property/CreatePropertyModal';
import { api, ApiError } from '@/lib/api';
import { Property, PropertyStats, PaginatedResponse } from '@/types';

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome to your real estate dashboard</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Properties</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalProperties || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Available in the system</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">My Active Listings</h3>
                  <p className="text-3xl font-bold text-green-600">{stats?.myActiveListings || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Your property listings</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/properties"
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Browse Listings
                  </Link>
                  <Link
                    href="/my-listings"
                    className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    My Listings
                  </Link>
                  <button
                    className="flex items-center justify-center px-6 py-3 border border-transparent rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create Property
                  </button>
                </div>
              </div>

              {/* Recent Properties */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Properties</h2>
                  <Link
                    href="/properties"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                {properties.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-gray-600">No properties available yet.</p>
                    <Link
                      href="/properties"
                      className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                    >
                      Browse all listings
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
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
