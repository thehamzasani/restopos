// src/app/(dashboard)/inventory/page.tsx

import { Metadata } from "next"
import { InventoryList } from "@/components/inventory/InventoryList"

export const metadata: Metadata = {
  title: "Inventory Management | RestoPOS",
  description: "Manage restaurant inventory and stock levels",
}

export default function InventoryPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <InventoryList />
    </div>
  )
}