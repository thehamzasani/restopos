import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      email: string
      name: string
    }
  }

  interface User {
    id: string
    role: UserRole
    email: string
    name: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}