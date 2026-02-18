-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'DELIVERY';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryArea" TEXT,
ADD COLUMN     "deliveryCharge" DECIMAL(10,2);
