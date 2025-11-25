'use client';

import { useState, useEffect, useCallback } from 'react';
import { rentalApi } from '@/lib/rental-api';
import { RentalLease, RentalLeaseStatus } from '@/types';

const STATUS_TABS: { label: string; value: RentalLeaseStatus }[] = [
  { label: 'Active', value: RentalLeaseStatus.ACTIVE },
  { label: 'Pending', value: RentalLeaseStatus.PENDING },
  { label: 'Completed', value: RentalLeaseStatus.COMPLETED },
  { label: 'Terminated', value: RentalLeaseStatus.TERMINATED },
];

export default function LeasesTab() {
  const [leases, setLeases] = useState<RentalLease[]>([]);
  const [activeStatus, setActiveStatus] = useState<RentalLeaseStatus>(RentalLeaseStatus.ACTIVE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeases = useCallback(async (status: RentalLeaseStatus) => {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalApi.getLandlordLeases(status);
      setLeases(data);
    } catch (err: unknown) {
      const fetchError = err instanceof Error ? err.message : 'Failed to load leases';
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeases(activeStatus);
  }, [activeStatus, fetchLeases]);

  const handleStatusChange = (status: RentalLeaseStatus) => {
    setActiveStatus(status);
  };

  const getStatusBadgeClass = (status: RentalLeaseStatus) => {
    switch (status) {
      case RentalLeaseStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case RentalLeaseStatus.PENDING:
        return 'bg-amber-100 text-amber-800';
      case RentalLeaseStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      case RentalLeaseStatus.TERMINATED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeStatus === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <span className="ml-3 text-gray-600">Loading leases...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : leases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No {activeStatus.toLowerCase()} leases found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lease Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Rent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leases.map((lease) => (
                <tr key={lease.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lease.rentalListing?.property?.title || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {lease.rentalListing?.property?.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lease.tenant?.firstName} {lease.tenant?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{lease.tenant?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(lease.startDate).toLocaleDateString()} -{' '}
                      {new Date(lease.endDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${Number(lease.monthlyRent).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Day {lease.paymentDay}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                        lease.status
                      )}`}
                    >
                      {lease.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
