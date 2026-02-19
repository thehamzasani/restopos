// src/app/api/menu/[id]/ingredients/route.ts

import { NextRequest, NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const ingredientSchema = z.object({
  inventoryId: z.string(),
  quantityUsed: z.number().positive("Quantity must be positive"),
})

const ingredientsArraySchema = z.array(ingredientSchema)

// GET - Get all ingredients for a menu item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const ingredients = await prisma.menuItemIngredient.findMany({
      where: {
        menuItemId: id,
      },
      include: {
        inventory: {
          select: {
            id: true,
            name: true,
            unit: true,
            quantity: true,
            lowStockThreshold: true,
          },
        },
      },
      orderBy: {
        inventory: {
          name: "asc",
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: ingredients.map((ing) => ({
        id: ing.id,
        inventoryId: ing.inventoryId,
        inventoryName: ing.inventory.name,
        unit: ing.inventory.unit,
        quantityUsed: Number(ing.quantityUsed),
        currentStock: Number(ing.inventory.quantity),
        lowStockThreshold: Number(ing.inventory.lowStockThreshold),
      })),
    })
  } catch (error) {
    console.error("Get ingredients error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch ingredients" },
      { status: 500 }
    )
  }
}

// PUT - Update ingredients for a menu item (replace all)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validate input
    const validationResult = ingredientsArraySchema.safeParse(body.ingredients)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const ingredients = validationResult.data

    // Check if menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id },
    })

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      )
    }

    // Validate all inventory items exist
    const inventoryIds = ingredients.map((ing) => ing.inventoryId)
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        id: {
          in: inventoryIds,
        },
      },
    })

    if (inventoryItems.length !== inventoryIds.length) {
      return NextResponse.json(
        { success: false, error: "Some inventory items not found" },
        { status: 400 }
      )
    }

    // Update ingredients in transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing ingredients
      await tx.menuItemIngredient.deleteMany({
        where: {
          menuItemId: id,
        },
      })

      // Create new ingredients
      if (ingredients.length > 0) {
        await tx.menuItemIngredient.createMany({
          data: ingredients.map((ing) => ({
            menuItemId: id,
            inventoryId: ing.inventoryId,
            quantityUsed: ing.quantityUsed,
          })),
        })
      }
    })

    // Fetch updated ingredients
    const updatedIngredients = await prisma.menuItemIngredient.findMany({
      where: {
        menuItemId: id,
      },
      include: {
        inventory: {
          select: {
            id: true,
            name: true,
            unit: true,
            quantity: true,
            lowStockThreshold: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedIngredients.map((ing) => ({
        id: ing.id,
        inventoryId: ing.inventoryId,
        inventoryName: ing.inventory.name,
        unit: ing.inventory.unit,
        quantityUsed: Number(ing.quantityUsed),
        currentStock: Number(ing.inventory.quantity),
        lowStockThreshold: Number(ing.inventory.lowStockThreshold),
      })),
      message: "Ingredients updated successfully",
    })
  } catch (error) {
    console.error("Update ingredients error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update ingredients" },
      { status: 500 }
    )
  }
}

// DELETE - Remove all ingredients from a menu item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    await prisma.menuItemIngredient.deleteMany({
      where: {
        menuItemId: id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "All ingredients removed",
    })
  } catch (error) {
    console.error("Delete ingredients error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete ingredients" },
      { status: 500 }
    )
  }
}