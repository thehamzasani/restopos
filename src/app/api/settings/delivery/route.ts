// src/app/api/settings/delivery/route.ts
import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deliverySettingsSchema } from "@/lib/validations/settings"

// GET /api/settings/delivery - Get delivery settings
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const settings = await prisma.settings.findFirst({
      select: { id: true, deliveryFee: true, minOrderAmount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        deliveryFee: Number(settings?.deliveryFee ?? 0),
        minOrderAmount: Number(settings?.minOrderAmount ?? 0),
      },
    })
  } catch (error) {
    console.error("[GET /api/settings/delivery]", error)
    return NextResponse.json({ success: false, error: "Failed to fetch delivery settings" }, { status: 500 })
  }
}

// PUT /api/settings/delivery - Update delivery settings
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!["ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = deliverySettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { deliveryFee, minOrderAmount } = parsed.data

    const existing = await prisma.settings.findFirst()

    let settings
    if (existing) {
      settings = await prisma.settings.update({
        where: { id: existing.id },
        data: { deliveryFee, minOrderAmount },
      })
    } else {
      settings = await prisma.settings.create({
        data: {
          restaurantName: "My Restaurant",
          taxRate: 10,
          currency: "USD",
          deliveryFee,
          minOrderAmount,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        deliveryFee: Number(settings.deliveryFee),
        minOrderAmount: Number(settings.minOrderAmount),
      },
      message: "Delivery settings updated",
    })
  } catch (error) {
    console.error("[PUT /api/settings/delivery]", error)
    return NextResponse.json({ success: false, error: "Failed to update delivery settings" }, { status: 500 })
  }
}