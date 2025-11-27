-- AlterTable
ALTER TABLE "RentalListing" ADD COLUMN     "escalationIntervalMonths" INTEGER,
ADD COLUMN     "escalationPercentage" DECIMAL(5,2),
ADD COLUMN     "rentEscalationEnabled" BOOLEAN NOT NULL DEFAULT false;
