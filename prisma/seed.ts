// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.menuItemIngredient.deleteMany()
  await prisma.stockHistory.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.user.deleteMany()
  await prisma.settings.deleteMany()

  console.log('✅ Cleared existing data')

  // Seed Users
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@restopos.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  const manager = await prisma.user.create({
    data: {
      name: 'Manager User',
      email: 'manager@restopos.com',
      password: hashedPassword,
      role: 'MANAGER',
      isActive: true,
    },
  })

  const cashier = await prisma.user.create({
    data: {
      name: 'Cashier User',
      email: 'cashier@restopos.com',
      password: hashedPassword,
      role: 'CASHIER',
      isActive: true,
    },
  })

  const kitchen = await prisma.user.create({
    data: {
      name: 'Kitchen Staff',
      email: 'kitchen@restopos.com',
      password: hashedPassword,
      role: 'KITCHEN',
      isActive: true,
    },
  })

  console.log('✅ Created users (password: admin123)')

  // Seed Categories
  const appetizers = await prisma.category.create({
    data: {
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
      sortOrder: 1,
      isActive: true,
    },
  })

  const mainCourse = await prisma.category.create({
    data: {
      name: 'Main Course',
      description: 'Hearty main dishes to satisfy your hunger',
      sortOrder: 2,
      isActive: true,
    },
  })

  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Refresh yourself with our drinks',
      sortOrder: 3,
      isActive: true,
    },
  })

  const desserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      description: 'Sweet endings to your perfect meal',
      sortOrder: 4,
      isActive: true,
    },
  })

  const salads = await prisma.category.create({
    data: {
      name: 'Salads',
      description: 'Fresh and healthy salad options',
      sortOrder: 5,
      isActive: true,
    },
  })

  console.log('✅ Created categories')

  // Seed Menu Items
  // Appetizers
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Chicken Wings',
        description: 'Crispy fried chicken wings with special sauce',
        price: 8.99,
        categoryId: appetizers.id,
        isAvailable: true,
        preparationTime: 15,
      },
      {
        name: 'Mozzarella Sticks',
        description: 'Golden fried mozzarella with marinara sauce',
        price: 6.99,
        categoryId: appetizers.id,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Spring Rolls',
        description: 'Vegetable spring rolls with sweet chili sauce',
        price: 5.99,
        categoryId: appetizers.id,
        isAvailable: true,
        preparationTime: 12,
      },
      {
        name: 'Nachos Supreme',
        description: 'Tortilla chips with cheese, jalapeños, and salsa',
        price: 9.99,
        categoryId: appetizers.id,
        isAvailable: true,
        preparationTime: 10,
      },
    ],
  })

  // Main Course
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Classic Burger',
        description: 'Juicy beef patty with lettuce, tomato, and cheese',
        price: 12.99,
        categoryId: mainCourse.id,
        isAvailable: true,
        preparationTime: 20,
      },
      {
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil',
        price: 14.99,
        categoryId: mainCourse.id,
        isAvailable: true,
        preparationTime: 25,
      },
      {
        name: 'Grilled Chicken',
        description: 'Marinated grilled chicken with vegetables',
        price: 15.99,
        categoryId: mainCourse.id,
        isAvailable: true,
        preparationTime: 30,
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with bacon and parmesan',
        price: 13.99,
        categoryId: mainCourse.id,
        isAvailable: true,
        preparationTime: 20,
      },
      {
        name: 'Fish and Chips',
        description: 'Crispy battered fish with french fries',
        price: 16.99,
        categoryId: mainCourse.id,
        isAvailable: true,
        preparationTime: 25,
      },
      {
        name: 'Beef Steak',
        description: '8oz premium beef steak with mashed potatoes',
        price: 24.99,
        categoryId: mainCourse.id,
        isAvailable: true,
        preparationTime: 35,
      },
    ],
  })

  // Beverages
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Coca Cola',
        description: 'Chilled Coca Cola',
        price: 2.99,
        categoryId: beverages.id,
        isAvailable: true,
        preparationTime: 2,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        categoryId: beverages.id,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: 'Iced Coffee',
        description: 'Cold brew coffee with ice',
        price: 3.99,
        categoryId: beverages.id,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: 'Mineral Water',
        description: 'Bottled mineral water',
        price: 1.99,
        categoryId: beverages.id,
        isAvailable: true,
        preparationTime: 1,
      },
      {
        name: 'Mango Smoothie',
        description: 'Fresh mango blended smoothie',
        price: 5.99,
        categoryId: beverages.id,
        isAvailable: true,
        preparationTime: 5,
      },
    ],
  })

  // Desserts
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with vanilla ice cream',
        price: 6.99,
        categoryId: desserts.id,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian coffee-flavored dessert',
        price: 7.99,
        categoryId: desserts.id,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: 'Ice Cream Sundae',
        description: 'Three scoops with toppings',
        price: 5.99,
        categoryId: desserts.id,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: 'Apple Pie',
        description: 'Warm apple pie with cinnamon',
        price: 6.49,
        categoryId: desserts.id,
        isAvailable: true,
        preparationTime: 8,
      },
    ],
  })

  // Salads
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Caesar Salad',
        description: 'Romaine lettuce with Caesar dressing and croutons',
        price: 8.99,
        categoryId: salads.id,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Greek Salad',
        description: 'Fresh vegetables with feta cheese and olives',
        price: 9.99,
        categoryId: salads.id,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Garden Salad',
        description: 'Mixed greens with house dressing',
        price: 7.99,
        categoryId: salads.id,
        isAvailable: true,
        preparationTime: 8,
      },
    ],
  })

  console.log('✅ Created menu items')

  // Seed Tables
  await prisma.table.createMany({
    data: [
      { number: 1, capacity: 2, status: 'AVAILABLE' },
      { number: 2, capacity: 2, status: 'AVAILABLE' },
      { number: 3, capacity: 4, status: 'AVAILABLE' },
      { number: 4, capacity: 4, status: 'AVAILABLE' },
      { number: 5, capacity: 6, status: 'AVAILABLE' },
      { number: 6, capacity: 6, status: 'AVAILABLE' },
      { number: 7, capacity: 8, status: 'AVAILABLE' },
      { number: 8, capacity: 4, status: 'AVAILABLE' },
      { number: 9, capacity: 2, status: 'AVAILABLE' },
      { number: 10, capacity: 4, status: 'AVAILABLE' },
    ],
  })

  console.log('✅ Created tables')

  // Seed Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'Fresh Foods Co.',
      contact: 'John Smith',
      email: 'contact@freshfoods.com',
      phone: '+1234567890',
      address: '123 Market Street, City, State 12345',
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Beverage Distributors Inc.',
      contact: 'Jane Doe',
      email: 'info@beveragedist.com',
      phone: '+0987654321',
      address: '456 Distribution Ave, City, State 12345',
    },
  })

  console.log('✅ Created suppliers')

  // Seed Inventory
  await prisma.inventory.createMany({
    data: [
      {
        name: 'Chicken Breast',
        description: 'Fresh chicken breast',
        quantity: 50,
        unit: 'kg',
        lowStockThreshold: 10,
        costPerUnit: 8.5,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Beef Patties',
        description: 'Premium beef patties',
        quantity: 100,
        unit: 'pieces',
        lowStockThreshold: 20,
        costPerUnit: 2.5,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Mozzarella Cheese',
        description: 'Fresh mozzarella cheese',
        quantity: 25,
        unit: 'kg',
        lowStockThreshold: 5,
        costPerUnit: 12,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Tomatoes',
        description: 'Fresh tomatoes',
        quantity: 30,
        unit: 'kg',
        lowStockThreshold: 10,
        costPerUnit: 3,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Lettuce',
        description: 'Fresh lettuce',
        quantity: 20,
        unit: 'kg',
        lowStockThreshold: 5,
        costPerUnit: 2.5,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Coca Cola',
        description: '500ml bottles',
        quantity: 200,
        unit: 'bottles',
        lowStockThreshold: 50,
        costPerUnit: 1.2,
        supplierId: supplier2.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Orange Juice',
        description: '1L cartons',
        quantity: 50,
        unit: 'cartons',
        lowStockThreshold: 15,
        costPerUnit: 3.5,
        supplierId: supplier2.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Pasta',
        description: 'Spaghetti pasta',
        quantity: 40,
        unit: 'kg',
        lowStockThreshold: 10,
        costPerUnit: 4,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Flour',
        description: 'All-purpose flour',
        quantity: 60,
        unit: 'kg',
        lowStockThreshold: 15,
        costPerUnit: 2,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
      {
        name: 'Potatoes',
        description: 'Fresh potatoes for fries',
        quantity: 80,
        unit: 'kg',
        lowStockThreshold: 20,
        costPerUnit: 1.5,
        supplierId: supplier1.id,
        lastRestocked: new Date(),
      },
    ],
  }

)

// ─── ADD THIS SECTION to your existing seed.ts ───────────────────────────────
// Place this INSIDE your main() function, at the very end before the console.log summary

  // Seed Test Orders (past 7 days)
  const menuItems = await prisma.menuItem.findMany({ take: 5 })
  const tables = await prisma.table.findMany({ take: 3 })
  const orderTypes = ["DINE_IN", "TAKEAWAY", "DELIVERY"] as const
  const paymentMethods = ["CASH", "CARD"] as const

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(12, 0, 0, 0)

    for (let j = 0; j < 3; j++) {
      const orderType = orderTypes[j % orderTypes.length]
      const item = menuItems[j % menuItems.length]
      const quantity = Math.floor(Math.random() * 3) + 1
      const subtotal = Math.round(Number(item.price) * quantity * 100) / 100
      const tax = Math.round(subtotal * 0.1 * 100) / 100
      const deliveryFee = orderType === "DELIVERY" ? 5 : 0
      const total = subtotal + tax + deliveryFee

      await prisma.order.create({
        data: {
          orderNumber: `TEST-${i}-${j}-${Date.now()}`,
          orderType,
          customerName: orderType !== "DINE_IN" ? `Test Customer ${j}` : null,
          customerPhone: orderType !== "DINE_IN" ? "0300-0000000" : null,
          tableId: orderType === "DINE_IN" ? tables[j % tables.length]?.id : null,
          subtotal,
          tax,
          discount: 0,
          deliveryFee,
          total,
          status: "COMPLETED",
          paymentMethod: paymentMethods[j % paymentMethods.length],
          paymentStatus: "PAID",
          userId: admin.id,
          deliveryAddress: orderType === "DELIVERY" ? "123 Test Street" : null,
          createdAt: date,
          orderItems: {
            create: {
              menuItemId: item.id,
              quantity,
              price: Number(item.price),
              subtotal,
            }
          }
        }
      })
    }
    console.log(`✅ Created test orders for ${date.toDateString()}`)
  }

  console.log('✅ Created test orders for past 7 days')
  console.log('✅ Created inventory items')

  // Seed Settings
  await prisma.settings.create({
    data: {
      restaurantName: 'RestoPOS Restaurant',
      address: '789 Main Street, Downtown, City 12345',
      phone: '+1234567890',
      email: 'info@restopos.com',
      taxRate: 10.0,
      currency: 'USD',
      receiptHeader: 'Thank you for dining with us!',
      receiptFooter: 'Visit us again soon!',
    },
  })

  console.log('✅ Created settings')

  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log('   - 4 Users created (admin, manager, cashier, kitchen)')
  console.log('   - 5 Categories created')
  console.log('   - 26 Menu Items created')
  console.log('   - 10 Tables created')
  console.log('   - 2 Suppliers created')
  console.log('   - 10 Inventory Items created')
  console.log('   - 1 Settings record created')
  console.log('')
  console.log('🔑 Default Login:')
  console.log('   Email: admin@restopos.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })