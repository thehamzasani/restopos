// src/app/api/settings/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { restaurantSettingsSchema } from "@/lib/validations/settings"

// GET /api/settings - Get restaurant settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get or create settings
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.settings.create({
        data: {
          restaurantName: "My Restaurant",
          taxRate: 10,
          currency: "USD",
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update restaurant settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only ADMIN and MANAGER can update settings
    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Only admins and managers can update settings" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = restaurantSettingsSchema.parse(body)

    // Get existing settings
    let settings = await prisma.settings.findFirst()

    if (!settings) {
      // Create if doesn't exist
      settings = await prisma.settings.create({
        data: {
          ...validatedData,
          taxRate: 10, // Default tax rate
        },
      })
    } else {
      // Update existing
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: validatedData,
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Settings updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating settings:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    )
  }
}