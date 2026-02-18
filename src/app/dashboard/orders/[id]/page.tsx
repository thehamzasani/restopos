import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { OrderDetails } from "@/components/orders/OrderDetails"
import { OrderReceiptButton } from "@/components/orders/OrderReceiptButton" 
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"

interface OrderPageProps {
  params: Promise<{
    id: string
  }>
}

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      table: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              image: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!order) return null

  // ✅ IMPORTANT: Convert Decimal to number for Client Components
  return {
    ...order,
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    discount: Number(order.discount),
    total: Number(order.total),
    deliveryFee: order.deliveryFee ? Number(order.deliveryFee) : null,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    })),
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  const { id } = await params 
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500">View and manage order information</p>
          </div>
        </div>
        
        {/* ✅ UPDATED: Use new client component for receipt */}
        <OrderReceiptButton orderId={id} />
      </div>

      {/* Order Details */}
      <OrderDetails order={order} />
    </div>
  )
}