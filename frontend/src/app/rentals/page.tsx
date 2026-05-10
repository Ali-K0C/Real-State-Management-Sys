'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RentalListingCard from '@/components/rental/RentalListingCard';
import { rentalApi } from '@/lib/rental-api';
import type { RentalListing } from '@/types';
import { PropertyCardSkeletonGrid } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RentalsPage() {
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [location, setLocation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;
  
  const [filterTrigger, setFilterTrigger] = useState(0);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: {
        page: number;
        limit: number;
        location?: string;
        minRent?: number;
        maxRent?: number;
        bedrooms?: number;
      } = { page, limit };
      if (location) params.location = location;
      if (minRent) params.minRent = parseFloat(minRent);
      if (maxRent) params.maxRent = parseFloat(maxRent);
      if (bedrooms) params.bedrooms = parseInt(bedrooms);

      const response = await rentalApi.getListings(params);
      setListings(response.data);
      setTotalPages(response.totalPages);
    } catch (err) {
      const fetchError = err as Error;
      setError(fetchError.message || 'Failed to load rental listings');
    } finally {
      setLoading(false);
    }
  }, [page, location, minRent, maxRent, bedrooms]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings, filterTrigger]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setFilterTrigger(t => t + 1);
  };

  const clearFilters = () => {
    setLocation('');
    setMinRent('');
    setMaxRent('');
    setBedrooms('');
    setPage(1);
    setFilterTrigger(t => t + 1);
  };

  const hasActiveFilters = location || minRent || maxRent || bedrooms;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in-down">
          <h1 className="text-3xl font-bold text-gray-900">
            Rental Properties
          </h1>
          <p className="mt-2 text-gray-500">
            Find your perfect rental home from our available listings
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm animate-fade-in-up">
          <form onSubmit={handleFilter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or area"
                  className="h-11"
                />
              </div>
              
              <div>
                <label htmlFor="minRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent (Rs)
                </label>
                <Input
                  type="number"
                  id="minRent"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  placeholder="Min"
                  className="h-11"
                />
              </div>
              
              <div>
                <label htmlFor="maxRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent (Rs)
                </label>
                <Input
                  type="number"
                  id="maxRent"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="Max"
                  className="h-11"
                />
              </div>
              
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms
                </label>
                <select
                  id="bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
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
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 btn-hover"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Clear All
                </Button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
            {error}
          </div>
        )}

        {loading ? (
          <PropertyCardSkeletonGrid count={8} />
        ) : listings.length === 0 ? (
          <div className="animate-fade-in">
            <EmptyState 
              title="No rental listings found" 
              message="Try adjusting your filters to find more properties"
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {listings.map((listing, index) => (
                <div key={listing.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}>
                  <RentalListingCard listing={listing} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 animate-fade-in-up">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-gray-200 hover:border-emerald-300 hover:bg-emerald-50"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-500 text-sm">
                  Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
    </AppLayout>
  );
}
