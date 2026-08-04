-- AlterTable
ALTER TABLE "Property" DROP COLUMN "mlsNumber",
DROP COLUMN "mlsSource",
DROP COLUMN "schoolRating",
DROP COLUMN "taxAmount",
DROP COLUMN "transitScore",
DROP COLUMN "walkScore",
ADD COLUMN     "nearbyLandmark" TEXT;

