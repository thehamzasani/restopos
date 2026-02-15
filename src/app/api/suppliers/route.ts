// src/app/api/suppliers/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { supplierSchema } from "@/lib/validations/inventory"
import { z } from "zod"

// GET /api/suppliers - Get all suppliers
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { inventory: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: suppliers,
    })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = supplierSchema.parse(body)

    const supplier = await prisma.supplier.create({
      data: validatedData,
    })

    return NextResponse.json(
      {
        success: true,
        data: supplier,
        message: "Supplier created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating supplier:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 }
    )
  }
}