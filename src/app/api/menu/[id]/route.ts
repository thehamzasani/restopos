import { NextRequest, NextResponse } from "next/server"
import getServerSession from "next-auth"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { menuItemUpdateSchema } from "@/lib/validations/menuItem"

// GET /api/menu/[id] - Get single menu item
export async function GET(
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

        const menuItem = await prisma.menuItem.findUnique({
            where: {  id },
            include: {
                category: true,
                ingredients: {
                    include: {
                        inventory: true,
                    },
                },
            },
        })

        if (!menuItem) {
            return NextResponse.json(
                { success: false, error: "Menu item not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: menuItem,
        })
    } catch (error) {
        console.error("Error fetching menu item:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch menu item" },
            { status: 500 }
        )
    }
}

// PUT /api/menu/[id] - Update menu item
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
        const validatedData = menuItemUpdateSchema.parse(body)

        // If categoryId is being updated, check if it exists
        if (validatedData.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: validatedData.categoryId },
            })

            if (!category) {
                return NextResponse.json(
                    { success: false, error: "Category not found" },
                    { status: 404 }
                )
            }
        }

        const menuItem = await prisma.menuItem.update({
            where: { id},
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
            message: "Menu item updated successfully",
        })
    } catch (error: any) {
        console.error("Error updating menu item:", error)

        if (error.name === "ZodError") {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.errors },
                { status: 400 }
            )
        }

        if (error.code === "P2025") {
            return NextResponse.json(
                { success: false, error: "Menu item not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { success: false, error: "Failed to update menu item" },
            { status: 500 }
        )
    }
}

// DELETE /api/menu/[id] - Delete menu item
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
                { success: false, error: "Only admins can delete menu items" },
                { status: 403 }
            )
        }

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

        await prisma.menuItem.delete({
            where: { id },
        })

        return NextResponse.json({
            success: true,
            message: "Menu item deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting menu item:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete menu item" },
            { status: 500 }
        )
    }
}