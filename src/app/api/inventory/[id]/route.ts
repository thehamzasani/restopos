// src/app/api/inventory/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inventorySchema, stockAdjustmentSchema } from "@/lib/validations/inventory"
import { z } from "zod"
import { Decimal } from "@prisma/client/runtime/library"

// GET /api/inventory/[id] - Get single inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const inventoryItem = await prisma.inventory.findUnique({
      where: { id },
      include: {
        supplier: true,
        stockHistory: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        menuItems: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, error: "Inventory item not found" },
        { status: 404 }
      )
    }

    // Serialize Decimals
    const serializedItem = {
      ...inventoryItem,
      quantity: Number(inventoryItem.quantity),
      lowStockThreshold: Number(inventoryItem.lowStockThreshold),
      costPerUnit: inventoryItem.costPerUnit
        ? Number(inventoryItem.costPerUnit)
        : null,
      stockHistory: inventoryItem.stockHistory.map((history) => ({
        ...history,
        quantity: Number(history.quantity),
      })),
      menuItems: inventoryItem.menuItems.map((mi) => ({
        ...mi,
        quantityUsed: Number(mi.quantityUsed),
        menuItem: {
          ...mi.menuItem,
          price: Number(mi.menuItem.price),
        },
      })),
    }

    return NextResponse.json({
      success: true,
      data: serializedItem,
    })
  } catch (error) {
    console.error("Error fetching inventory item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory item" },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const { id } = await params
    const session = await auth()
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = inventorySchema.parse(body)

    const inventoryItem = await prisma.inventory.update({
      where: { id },
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
      },
      include: {
        supplier: true,
      },
    })

    const serializedItem = {
      ...inventoryItem,
      quantity: Number(inventoryItem.quantity),
      lowStockThreshold: Number(inventoryItem.lowStockThreshold),
      costPerUnit: inventoryItem.costPerUnit
        ? Number(inventoryItem.costPerUnit)
        : null,
    }

    return NextResponse.json({
      success: true,
      data: serializedItem,
      message: "Inventory item updated successfully",
    })
  } catch (error) {
    console.error("Error updating inventory:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update inventory item" },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if inventory is linked to menu items
    const linkedItems = await prisma.menuItemIngredient.count({
      where: { inventoryId: id },
    })

    if (linkedItems > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete. This item is linked to ${linkedItems} menu item(s)`,
        },
        { status: 400 }
      )
    }

    await prisma.inventory.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Inventory item deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting inventory:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete inventory item" },
      { status: 500 }
    )
  }
}

// PATCH /api/inventory/[id] - Adjust stock
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = stockAdjustmentSchema.parse(body)

    // Get current inventory
    const currentInventory = await prisma.inventory.findUnique({
      where: { id },
    })

    if (!currentInventory) {
      return NextResponse.json(
        { success: false, error: "Inventory item not found" },
        { status: 404 }
      )
    }

    const currentQty = Number(currentInventory.quantity)
    let newQuantity = currentQty

    // Calculate new quantity based on type
    if (validatedData.type === "IN") {
      newQuantity = currentQty + validatedData.quantity
    } else if (validatedData.type === "OUT") {
      newQuantity = currentQty - validatedData.quantity
    } else {
      newQuantity = validatedData.quantity
    }

    // Prevent negative stock
    if (newQuantity < 0) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock" },
        { status: 400 }
      )
    }

    // Update inventory and create history in transaction
    const [updatedInventory] = await prisma.$transaction([
      prisma.inventory.update({
        where: { id },
        data: {
          quantity: new Decimal(newQuantity),
          lastRestocked: validatedData.type === "IN" ? new Date() : undefined,
        },
        include: {
          supplier: true,
        },
      }),
      prisma.stockHistory.create({
        data: {
          inventoryId: id,
          quantity: new Decimal(Math.abs(validatedData.quantity)),
          type: validatedData.type,
          reason: validatedData.reason,
        },
      }),
    ])

    const serializedItem = {
      ...updatedInventory,
      quantity: Number(updatedInventory.quantity),
      lowStockThreshold: Number(updatedInventory.lowStockThreshold),
      costPerUnit: updatedInventory.costPerUnit
        ? Number(updatedInventory.costPerUnit)
        : null,
    }

    return NextResponse.json({
      success: true,
      data: serializedItem,
      message: "Stock adjusted successfully",
    })
  } catch (error) {
    console.error("Error adjusting stock:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to adjust stock" },
      { status: 500 }
    )
  }
}