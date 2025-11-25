'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { RentalListing } from '@/types';

interface RentConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: RentalListing;
}

export default function RentConfirmDialog({
  isOpen,
  onClose,
  listing,
}: RentConfirmDialogProps) {
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    // Placeholder – will call lease creation in next PR
    setConfirmed(true);
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  const property = listing.property;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Rental</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {confirmed ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Rental flow coming next!</p>
                <p className="text-sm">Lease creation will be implemented in the next update.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Rental Summary */}
              {property && (
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Rental Details
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-medium text-foreground">{property.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium text-foreground">{property.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Rent:</span>
                      <span className="font-bold text-primary">
                        Rs {Number(listing.monthlyRent).toLocaleString()}/month
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Deposit:</span>
                      <span className="font-medium text-foreground">
                        Rs {Number(listing.securityDeposit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder Message */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-amber-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      This is a placeholder. In the next step we will finalize the rental flow and create a lease.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            {confirmed ? 'Close' : 'Cancel'}
          </Button>
          {!confirmed && (
            <Button
              type="button"
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
