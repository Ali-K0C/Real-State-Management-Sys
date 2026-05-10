'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { rentalApi } from '@/lib/rental-api';
import { RentalLease, RentalLeaseStatus } from '@/types';
import { TableSkeleton } from '@/components/ui/Skeleton';

const STATUS_TABS: { label: string; value: RentalLeaseStatus }[] = [
  { label: 'Active', value: RentalLeaseStatus.ACTIVE },
  { label: 'Pending', value: RentalLeaseStatus.PENDING },
  { label: 'Completed', value: RentalLeaseStatus.COMPLETED },
  { label: 'Terminated', value: RentalLeaseStatus.TERMINATED },
];

export default function LeasesTab() {
  const router = useRouter();
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

  const handleLeaseClick = (leaseId: string) => {
    router.push(`/rental-tracker/leases/${leaseId}`);
  };

  const getStatusBadgeClass = (status: RentalLeaseStatus) => {
    switch (status) {
      case RentalLeaseStatus.ACTIVE:
        return 'bg-emerald-100 text-emerald-800';
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
      <div className="flex border-b border-gray-200">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeStatus === tab.value
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
          {error}
        </div>
      ) : leases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No {activeStatus.toLowerCase()} leases found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Lease Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leases.map((lease) => (
                  <tr
                    key={lease.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleLeaseClick(lease.id)}
                  >
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
                      <div className="text-sm font-semibold text-emerald-600">
                        Rs {Number(lease.monthlyRent).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Day {lease.paymentDay}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                          lease.status
                        )}`}
                      >
                        {lease.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaseClick(lease.id);
                        }}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
