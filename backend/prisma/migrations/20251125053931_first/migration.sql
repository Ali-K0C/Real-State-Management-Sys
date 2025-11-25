-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('FOR_SALE', 'FOR_RENT');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "listingType" "ListingType" NOT NULL DEFAULT 'FOR_SALE',
ADD COLUMN     "monthlyRent" DECIMAL(12,2),
ADD COLUMN     "securityDeposit" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "Property_listingType_idx" ON "Property"("listingType");
