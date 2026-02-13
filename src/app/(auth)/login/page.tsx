import { Metadata } from "next"
import LoginForm from "@/components/auth/LoginForm"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Login | RestoPOS",
  description: "Sign in to your account",
}

export default async function LoginPage() {
  const { auth } = await import("@/lib/auth")
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">RestoPOS</h1>
          <p className="mt-2 text-sm text-gray-600">
            Restaurant Management System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          <LoginForm />

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-xs text-blue-800">
              <p>Admin: admin@restopos.com / admin123</p>
              <p>Manager: manager@restopos.com / admin123</p>
              <p>Cashier: cashier@restopos.com / admin123</p>
              <p>Kitchen: kitchen@restopos.com / admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          © 2024 RestoPOS. All rights reserved.
        </p>
      </div>
    </div>
  )
}
