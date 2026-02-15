// src/app/api/inventory/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inventorySchema } from "@/lib/validations/inventory"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const lowStockOnly = searchParams.get("lowStock") === "true"

    const inventoryItems = await prisma.inventory.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          lowStockOnly
            ? {
                quantity: {
                  lte: prisma.inventory.fields.lowStockThreshold,
                },
              }
            : {},
        ],
      },
      include: {
        supplier: true,
        stockHistory: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { name: "asc" },
    })

    // Convert Decimal to number for JSON serialization
    const serializedItems = inventoryItems.map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      lowStockThreshold: Number(item.lowStockThreshold),
      costPerUnit: item.costPerUnit ? Number(item.costPerUnit) : null,
      stockHistory: item.stockHistory.map((history) => ({
        ...history,
        quantity: Number(history.quantity),
      })),
    }))

    return NextResponse.json({
      success: true,
      data: serializedItems,
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = inventorySchema.parse(body)

    // Create inventory item
    const inventoryItem = await prisma.inventory.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        quantity: new Decimal(validatedData.quantity),
        unit: validatedData.unit,
        lowStockThreshold: new Decimal(validatedData.lowStockThreshold),
        costPerUnit: validatedData.costPerUnit
          ? new Decimal(validatedData.costPerUnit)
          : null,
        supplierId: validatedData.supplierId,
        lastRestocked: new Date(),
      },
      include: {
        supplier: true,
      },
    })

    // Create initial stock history entry
    await prisma.stockHistory.create({
      data: {
        inventoryId: inventoryItem.id,
        quantity: new Decimal(validatedData.quantity),
        type: "IN",
        reason: "Initial stock",
      },
    })

    // Serialize for JSON
    const serializedItem = {
      ...inventoryItem,
      quantity: Number(inventoryItem.quantity),
      lowStockThreshold: Number(inventoryItem.lowStockThreshold),
      costPerUnit: inventoryItem.costPerUnit
        ? Number(inventoryItem.costPerUnit)
        : null,
    }

    return NextResponse.json(
      {
        success: true,
        data: serializedItem,
        message: "Inventory item created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating inventory:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create inventory item" },
      { status: 500 }
    )
  }
}