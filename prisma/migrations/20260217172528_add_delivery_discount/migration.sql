-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'OUT_FOR_DELIVERY';

-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'DELIVERY';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryAddress" TEXT,
ADD COLUMN     "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryNote" TEXT;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "minOrderAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
