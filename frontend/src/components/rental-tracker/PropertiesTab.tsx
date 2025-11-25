'use client';

import { useState, useEffect, useCallback } from 'react';
import { rentalApi } from '@/lib/rental-api';
import type { LandlordPropertyOverview } from '@/types';

export default function PropertiesTab() {
  const [properties, setProperties] = useState<LandlordPropertyOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalApi.getLandlordOverview();
      setProperties(data);
    } catch (err: unknown) {
      const fetchError = err instanceof Error ? err.message : 'Failed to load properties';
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <span className="ml-3 text-gray-600">Loading properties...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No rental properties found.</p>
        <p className="text-sm text-gray-500 mt-2">
          Create a rental listing to manage your properties here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Your Rental Properties ({properties.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((item) => (
          <div
            key={item.listingId}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
                  {item.property.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.isOccupied
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.isOccupied ? 'Rented' : 'Available'}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                {item.property.location}
              </p>

              <div className="flex items-baseline mb-3">
                <span className="text-2xl font-bold text-blue-600">
                  ${Number(item.monthlyRent).toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 ml-1">/month</span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  {item.property.bedrooms} bed • {item.property.bathrooms} bath
                </p>
                {item.currentLease && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="font-medium text-gray-900">
                      Tenant: {item.currentLease.tenant.firstName}{' '}
                      {item.currentLease.tenant.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lease ends:{' '}
                      {new Date(item.currentLease.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {item.nextDueDate && (
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                        item.nextDueStatus === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Next payment: {new Date(item.nextDueDate).toLocaleDateString()} ($
                      {Number(item.nextDueAmount).toLocaleString()})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
