import { NextRequest, NextResponse } from "next/server"
import  getServerSession  from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { categoryUpdateSchema } from "@/lib/validations/category"

// GET /api/categories/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        menuItems: {
          select: {
            id: true,
            name: true,
            price: true,
            isAvailable: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(
  request: NextRequest,
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

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = categoryUpdateSchema.parse(body)

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating category:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - Delete category
export async function DELETE(
  request: NextRequest,
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete categories" },
        { status: 403 }
      )
    }

    // Check if category has menu items
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    if (category._count.menuItems > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete category with menu items. Delete menu items first.",
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    )
  }
}