'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import RentalListingCard from '@/components/rental/RentalListingCard';
import { rentalApi } from '@/lib/rental-api';
import type { RentalListing } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RentalsPage() {
  const [listings, setListings] = useState<RentalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [location, setLocation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;
  
  // Filter trigger state to avoid stale closure issues
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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Rental Properties
          </h1>
          <p className="text-muted-foreground">
            Find your perfect rental home
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border mb-8">
          <form onSubmit={handleFilter} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
                  Location
                </label>
                <Input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or area"
                />
              </div>
              
              <div>
                <label htmlFor="minRent" className="block text-sm font-medium text-foreground mb-1">
                  Min Rent (Rs)
                </label>
                <Input
                  type="number"
                  id="minRent"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  placeholder="Min"
                />
              </div>
              
              <div>
                <label htmlFor="maxRent" className="block text-sm font-medium text-foreground mb-1">
                  Max Rent (Rs)
                </label>
                <Input
                  type="number"
                  id="maxRent"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  placeholder="Max"
                />
              </div>
              
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-foreground mb-1">
                  Bedrooms
                </label>
                <select
                  id="bedrooms"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
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
            </div>

            <div className="flex gap-3">
              <Button type="submit">
                Apply Filters
              </Button>
              <Button type="button" variant="secondary" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner />
        ) : listings.length === 0 ? (
          <EmptyState 
            title="No rental listings found" 
            message="Try adjusting your filters"
          />
        ) : (
          <>
            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {listings.map((listing) => (
                <RentalListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
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
