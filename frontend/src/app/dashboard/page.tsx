'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PropertyCard from '@/components/property/PropertyCard';
import CreatePropertyModal from '@/components/property/CreatePropertyModal';
import { api, ApiError } from '@/lib/api';
import { Property, PropertyStats, PaginatedResponse } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Welcome to your real estate dashboard</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Total Properties</h3>
                    <p className="text-3xl font-bold text-primary">{stats?.totalProperties || 0}</p>
                    <p className="text-sm text-muted-foreground mt-2">Available in the system</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">My Active Listings</h3>
                    <p className="text-3xl font-bold text-green-600">{stats?.myActiveListings || 0}</p>
                    <p className="text-sm text-muted-foreground mt-2">Your property listings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/properties">
                      <Button variant="outline" className="w-full h-12">
                        Browse Listings
                      </Button>
                    </Link>
                    <Link href="/my-listings">
                      <Button variant="outline" className="w-full h-12">
                        My Listings
                      </Button>
                    </Link>
                    <Button
                      className="w-full h-12"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      Create Property
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Properties */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Recent Properties</h2>
                  <Link href="/properties">
                    <Button variant="link" className="text-sm">
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
