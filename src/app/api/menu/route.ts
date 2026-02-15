import { NextRequest, NextResponse } from "next/server"
import getServerSession from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { menuItemSchema } from "@/lib/validations/menuItem"

// GET /api/menu - Get all menu items
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const search = searchParams.get("search")
    const availableOnly = searchParams.get("availableOnly") === "true"

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (availableOnly) {
      where.isAvailable = true
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        // ✅ NEW: Include ingredient count
        _count: {
          select: {
            ingredients: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: menuItems,
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu items" },
      { status: 500 }
    )
  }
}

// POST /api/menu - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only ADMIN and MANAGER can create menu items
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = menuItemSchema.parse(body)

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    const menuItem = await prisma.menuItem.create({
      data: validatedData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: menuItem,
      message: "Menu item created successfully",
    })
  } catch (error: any) {
    console.error("Error creating menu item:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create menu item" },
      { status: 500 }
    )
  }
}