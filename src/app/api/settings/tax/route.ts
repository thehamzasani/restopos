// src/app/api/settings/tax/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { taxSettingsSchema } from "@/lib/validations/settings"

// GET /api/settings/tax - Get tax settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await prisma.settings.findFirst({
      select: {
        taxRate: true,
      },
    })

    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Settings not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { taxRate: settings.taxRate },
    })
  } catch (error) {
    console.error("Error fetching tax settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch tax settings" },
      { status: 500 }
    )
  }
}

// PUT /api/settings/tax - Update tax settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only ADMIN and MANAGER can update tax settings
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Only admins and managers can update tax settings" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = taxSettingsSchema.parse(body)

    // Get existing settings
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.settings.create({
        data: {
          restaurantName: "My Restaurant",
          taxRate: validatedData.taxRate,
          currency: "USD",
        },
      })
    } else {
      // Update existing
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          taxRate: validatedData.taxRate,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: { taxRate: settings.taxRate },
      message: "Tax rate updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating tax settings:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update tax settings" },
      { status: 500 }
    )
  }
}