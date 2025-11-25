'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import PropertyCard from '@/components/property/PropertyCard';
import { api, ApiError } from '@/lib/api';
import { Property, PaginatedResponse } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Property Listings</h1>
        <p className="mt-2 text-muted-foreground">Browse all available properties</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Location filter */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
              Location
            </label>
            <select
              id="location"
              value={location}
              onChange={handleLocationChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms filter */}
          <div>
            <label htmlFor="bedrooms" className="block text-sm font-medium text-foreground mb-2">
              Bedrooms
            </label>
            <select
              id="bedrooms"
              value={bedrooms}
              onChange={(e) => updateParams({ bedrooms: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Bathrooms filter */}
          <div>
            <label htmlFor="bathrooms" className="block text-sm font-medium text-foreground mb-2">
              Bathrooms
            </label>
            <select
              id="bathrooms"
              value={bathrooms}
              onChange={(e) => updateParams({ bathrooms: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Min Area filter */}
          <div>
            <label htmlFor="minArea" className="block text-sm font-medium text-foreground mb-2">
              Min Area (sqft)
            </label>
            <Input
              type="number"
              id="minArea"
              value={minArea}
              onChange={(e) => updateParams({ minArea: e.target.value })}
              placeholder="Min"
              min={0}
            />
          </div>

          {/* Max Area filter */}
          <div>
            <label htmlFor="maxArea" className="block text-sm font-medium text-foreground mb-2">
              Max Area (sqft)
            </label>
            <Input
              type="number"
              id="maxArea"
              value={maxArea}
              onChange={(e) => updateParams({ maxArea: e.target.value })}
              placeholder="Max"
              min={0}
            />
          </div>
        </div>

        {/* Second row: Sort and results info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleSortChange('price')}
                variant={sortBy === 'price' ? 'default' : 'secondary'}
                size="sm"
                className="flex-1"
              >
                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
              <Button
                onClick={() => handleSortChange('createdAt')}
                variant={sortBy === 'createdAt' ? 'default' : 'secondary'}
                size="sm"
                className="flex-1"
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </Button>
            </div>
          </div>

          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              Showing {properties.length} of {total} properties
            </div>
          </div>

          <div className="flex items-end justify-end">
            <Button
              variant="link"
              onClick={() => router.push('/properties')}
              className="text-sm"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : properties.length === 0 ? (
        <EmptyState 
          title="No properties found" 
          message="No properties found matching your criteria."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
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
                      >
                        {pageNum}
                      </Button>
                    );
                  } else if (pageNum === page - 2 || pageNum === page + 2) {
                    return <span key={pageNum} className="px-2 text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
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
      <Suspense fallback={<LoadingSpinner />}>
        <PropertiesContent />
      </Suspense>
    </AppLayout>
  );
}
