import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import Sidebar from "@/components/layout/Sidebar"
import { CartProvider } from "@/context/CartProvider"  // ✅ Add this

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  return (
    <CartProvider>  {/* ✅ Wrap here */}
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </CartProvider>  
  )
}