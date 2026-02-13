import { NextRequest, NextResponse } from "next/server"
import getServerSession  from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tableUpdateSchema } from "@/lib/validations/table"
// GET /api/tables/[id] - Get single table
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        orders: {
          where: {
            status: {
              in: ["PENDING", "PREPARING", "READY"],
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!table) {
      return NextResponse.json(
        { success: false, error: "Table not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: table,
    })
  } catch (error) {
    console.error("Error fetching table:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch table" },
      { status: 500 }
    )
  }
}

// PUT /api/tables/[id] - Update table
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
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
    const validatedData = tableUpdateSchema.parse(body)

    const table = await prisma.table.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: table,
      message: "Table updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating table:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, error: "Table not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update table" },
      { status: 500 }
    )
  }
}

// DELETE /api/tables/[id] - Delete table
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admins can delete tables" },
        { status: 403 }
      )
    }

    // Check if table has active orders
    const table = await prisma.table.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: ["PENDING", "PREPARING", "READY"],
                },
              },
            },
          },
        },
      },
    })

    if (!table) {
      return NextResponse.json(
        { success: false, error: "Table not found" },
        { status: 404 }
      )
    }

    if (table._count.orders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete table with active orders",
        },
        { status: 400 }
      )
    }

    await prisma.table.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Table deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting table:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete table" },
      { status: 500 }
    )
  }
}