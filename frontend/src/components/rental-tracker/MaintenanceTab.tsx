'use client';

import { useState, useEffect, useCallback } from 'react';
import { rentalApi } from '@/lib/rental-api';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';
import { TableSkeleton } from '@/components/ui/Skeleton';

const STATUS_OPTIONS: MaintenanceStatus[] = [
  MaintenanceStatus.PENDING,
  MaintenanceStatus.IN_PROGRESS,
  MaintenanceStatus.COMPLETED,
  MaintenanceStatus.CANCELED,
];

export default function MaintenanceTab() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalApi.getMaintenanceRequests();
      setRequests(data);
    } catch (err: unknown) {
      const fetchError = err instanceof Error ? err.message : 'Failed to load maintenance requests';
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id: string, newStatus: MaintenanceStatus) => {
    setUpdatingId(id);
    try {
      await rentalApi.updateMaintenanceRequest(id, { status: newStatus });
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err: unknown) {
      const updateError = err instanceof Error ? err.message : 'Failed to update status';
      setError(updateError);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatStatusDisplay = (status: MaintenanceStatus): string => {
    switch (status) {
      case MaintenanceStatus.IN_PROGRESS:
        return 'In Progress';
      case MaintenanceStatus.PENDING:
        return 'Pending';
      case MaintenanceStatus.COMPLETED:
        return 'Completed';
      case MaintenanceStatus.CANCELED:
        return 'Canceled';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: MaintenanceStatus) => {
    switch (status) {
      case MaintenanceStatus.PENDING:
        return 'bg-amber-100 text-amber-800';
      case MaintenanceStatus.IN_PROGRESS:
        return 'bg-emerald-100 text-emerald-800';
      case MaintenanceStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case MaintenanceStatus.CANCELED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} columns={1} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-gray-500">No maintenance requests found</p>
        <p className="text-sm text-gray-400 mt-1">Requests from your properties will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">
          Maintenance Requests ({requests.length})
        </h2>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-emerald-200 transition-all card-hover"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getPriorityBadgeClass(
                      request.priority
                    )}`}
                  >
                    {request.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{request.description}</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {request.property?.title || 'N/A'}
                  </p>
                  <p className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {request.user?.firstName} {request.user?.lastName}
                  </p>
                  <p className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3 ml-4">
                <span
                  className={`px-3 py-1.5 text-sm font-medium rounded-full ${getStatusBadgeClass(
                    request.status
                  )}`}
                >
                  {formatStatusDisplay(request.status)}
                </span>
                <select
                  value={request.status}
                  onChange={(e) =>
                    handleStatusChange(request.id, e.target.value as MaintenanceStatus)
                  }
                  disabled={updatingId === request.id}
                  className="mt-2 block w-40 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50 transition-all"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {formatStatusDisplay(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
