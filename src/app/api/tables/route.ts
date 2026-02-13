import { NextRequest, NextResponse } from "next/server"
import  getServerSession  from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { tableSchema } from "@/lib/validations/table"

// GET /api/tables - Get all tables
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
    const status = searchParams.get("status")

    const tables = await prisma.table.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { number: "asc" },
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

    return NextResponse.json({
      success: true,
      data: tables,
    })
  } catch (error) {
    console.error("Error fetching tables:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tables" },
      { status: 500 }
    )
  }
}

// POST /api/tables - Create new table
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only ADMIN can create tables
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = tableSchema.parse(body)

    const table = await prisma.table.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      data: table,
      message: "Table created successfully",
    })
  } catch (error: any) {
    console.error("Error creating table:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Table number already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create table" },
      { status: 500 }
    )
  }
}