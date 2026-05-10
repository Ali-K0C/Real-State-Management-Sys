'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PropertyCard from '@/components/property/PropertyCard';
import { PropertyCardSkeletonGrid } from '@/components/ui/Skeleton';
import { api, ApiError } from '@/lib/api';
import { Property, PaginatedResponse } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const location = searchParams.get('location') || '';
  const sortBy = searchParams.get('sortBy') || 'price';
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const minArea = searchParams.get('minArea') || '';
  const maxArea = searchParams.get('maxArea') || '';
  const limit = 12;

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await api.get<string[]>('/properties/locations');
        setLocations(locationsData);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };

    void fetchLocations();
  }, []);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
          listingType: 'FOR_SALE',
        });

        if (location) {
          queryParams.append('location', location);
        }
        if (bedrooms) {
          queryParams.append('bedrooms', bedrooms);
        }
        if (bathrooms) {
          queryParams.append('bathrooms', bathrooms);
        }
        if (minArea) {
          queryParams.append('minArea', minArea);
        }
        if (maxArea) {
          queryParams.append('maxArea', maxArea);
        }

        const data = await api.get<PaginatedResponse<Property>>(
          `/properties?${queryParams.toString()}`
        );

        setProperties(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } catch (err) {
        const errorMessage = err instanceof ApiError 
          ? err.message 
          : 'Failed to load properties';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    void fetchProperties();
  }, [page, location, sortBy, sortOrder, bedrooms, bathrooms, minArea, maxArea]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if ('location' in updates || 'sortBy' in updates || 'sortOrder' in updates ||
        'bedrooms' in updates || 'bathrooms' in updates || 'minArea' in updates || 'maxArea' in updates) {
      params.set('page', '1');
    }

    router.push(`/properties?${params.toString()}`);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ location: e.target.value });
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      updateParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateParams({ sortBy: newSortBy, sortOrder: 'asc' });
    }
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const hasActiveFilters = location || bedrooms || bathrooms || minArea || maxArea;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-down">
        <h1 className="text-3xl font-bold text-gray-900">Property Listings</h1>
        <p className="mt-2 text-gray-500">Browse all available properties for sale</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm animate-fade-in-up">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={handleLocationChange}
              className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              value={bedrooms}
              onChange={(e) => updateParams({ bedrooms: e.target.value })}
              className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms
            </label>
            <select
              id="bathrooms"
              value={bathrooms}
              onChange={(e) => updateParams({ bathrooms: e.target.value })}
              className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <label htmlFor="minArea" className="block text-sm font-medium text-gray-700 mb-2">
              Min Area (sqft)
            </label>
            <Input
              type="number"
              id="minArea"
              value={minArea}
              onChange={(e) => updateParams({ minArea: e.target.value })}
              placeholder="Min"
              min={0}
              className="h-11"
            />
          </div>

          <div>
            <label htmlFor="maxArea" className="block text-sm font-medium text-gray-700 mb-2">
              Max Area (sqft)
            </label>
            <Input
              type="number"
              id="maxArea"
              value={maxArea}
              onChange={(e) => updateParams({ maxArea: e.target.value })}
              placeholder="Max"
              min={0}
              className="h-11"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleSortChange('price')}
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 h-10 ${sortBy === 'price' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}`}
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                onClick={() => handleSortChange('createdAt')}
                variant={sortBy === 'createdAt' ? 'default' : 'outline'}
                size="sm"
                className={`flex-1 h-10 ${sortBy === 'createdAt' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}`}
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{properties.length}</span> of <span className="font-medium text-gray-900">{total}</span> properties
            </div>
          </div>

          <div className="flex items-end justify-end">
            {hasActiveFilters && (
              <Button
                variant="link"
                onClick={() => router.push('/properties')}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium h-10"
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <PropertyCardSkeletonGrid count={12} />
      ) : properties.length === 0 ? (
        <div className="animate-fade-in">
          <EmptyState 
            title="No properties found" 
            message="No properties found matching your criteria. Try adjusting your filters."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {properties.map((property, index) => (
              <div key={property.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}>
                <PropertyCard property={property} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 animate-fade-in-up">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={pageNum === page ? 'default' : 'outline'}
                        size="sm"
                        className={pageNum === page ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <AppLayout>
      <Suspense fallback={<PropertyCardSkeletonGrid count={12} />}>
        <PropertiesContent />
      </Suspense>
    </AppLayout>
  );
}
