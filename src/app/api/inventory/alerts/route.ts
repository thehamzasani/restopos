// src/app/api/inventory/alerts/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/inventory/alerts - Get low stock items
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find items where quantity <= lowStockThreshold
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantity: {
          lte: prisma.inventory.fields.lowStockThreshold,
        },
      },
      include: {
        supplier: true,
      },
      orderBy: { quantity: "asc" },
    })

    // Serialize Decimals
    const serializedItems = lowStockItems.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      lowStockThreshold: Number(item.lowStockThreshold),
      costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
    }))

    return NextResponse.json({
      success: true,
      data: serializedItems,
      count: serializedItems.length,
    })
  } catch (error) {
    console.error("Error fetching low stock alerts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch low stock alerts" },
      { status: 500 }
    )
  }
}