
// import { defineConfig } from "prisma/config"

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   datasource: {
//     url: process.env.DATABASE_URL!,
//   },
// })


import { defineConfig } from 'prisma/config'

process.env.DATABASE_URL = "postgresql://postgres:hamzasani@localhost:5432/restopos"

export default defineConfig({
  schema: 'prisma/schema.prisma',
})