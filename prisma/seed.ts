// // prisma/seed.ts

// import { PrismaClient } from '@prisma/client'
// import * as bcrypt from 'bcryptjs'

// const prisma = new PrismaClient()

// async function main() {
//   console.log('🌱 Starting database seed...')

//   // Clear existing data
//   await prisma.orderItem.deleteMany()
//   await prisma.order.deleteMany()
//   await prisma.transaction.deleteMany()
//   await prisma.menuItemIngredient.deleteMany()
//   await prisma.stockHistory.deleteMany()
//   await prisma.inventory.deleteMany()
//   await prisma.supplier.deleteMany()
//   await prisma.menuItem.deleteMany()
//   await prisma.category.deleteMany()
//   await prisma.table.deleteMany()
//   await prisma.user.deleteMany()
//   await prisma.settings.deleteMany()

//   console.log('✅ Cleared existing data')

//   // Seed Users
//   const hashedPassword = await bcrypt.hash('admin123', 10)

//   const admin = await prisma.user.create({
//     data: {
//       name: 'Admin User',
//       email: 'admin@restopos.com',
//       password: hashedPassword,
//       role: 'ADMIN',
//       isActive: true,
//     },
//   })

//   const manager = await prisma.user.create({
//     data: {
//       name: 'Manager User',
//       email: 'manager@restopos.com',
//       password: hashedPassword,
//       role: 'MANAGER',
//       isActive: true,
//     },
//   })

//   const cashier = await prisma.user.create({
//     data: {
//       name: 'Cashier User',
//       email: 'cashier@restopos.com',
//       password: hashedPassword,
//       role: 'CASHIER',
//       isActive: true,
//     },
//   })

//   const kitchen = await prisma.user.create({
//     data: {
//       name: 'Kitchen Staff',
//       email: 'kitchen@restopos.com',
//       password: hashedPassword,
//       role: 'KITCHEN',
//       isActive: true,
//     },
//   })

//   console.log('✅ Created users (password: admin123)')

//   // Seed Categories
//   const appetizers = await prisma.category.create({
//     data: {
//       name: 'Appetizers',
//       description: 'Start your meal with our delicious appetizers',
//       sortOrder: 1,
//       isActive: true,
//     },
//   })

//   const mainCourse = await prisma.category.create({
//     data: {
//       name: 'Main Course',
//       description: 'Hearty main dishes to satisfy your hunger',
//       sortOrder: 2,
//       isActive: true,
//     },
//   })

//   const beverages = await prisma.category.create({
//     data: {
//       name: 'Beverages',
//       description: 'Refresh yourself with our drinks',
//       sortOrder: 3,
//       isActive: true,
//     },
//   })

//   const desserts = await prisma.category.create({
//     data: {
//       name: 'Desserts',
//       description: 'Sweet endings to your perfect meal',
//       sortOrder: 4,
//       isActive: true,
//     },
//   })

//   const salads = await prisma.category.create({
//     data: {
//       name: 'Salads',
//       description: 'Fresh and healthy salad options',
//       sortOrder: 5,
//       isActive: true,
//     },
//   })

//   console.log('✅ Created categories')

//   // Seed Menu Items
//   // Appetizers
//   await prisma.menuItem.createMany({
//     data: [
//       {
//         name: 'Chicken Wings',
//         description: 'Crispy fried chicken wings with special sauce',
//         price: 8.99,
//         categoryId: appetizers.id,
//         isAvailable: true,
//         preparationTime: 15,
//       },
//       {
//         name: 'Mozzarella Sticks',
//         description: 'Golden fried mozzarella with marinara sauce',
//         price: 6.99,
//         categoryId: appetizers.id,
//         isAvailable: true,
//         preparationTime: 10,
//       },
//       {
//         name: 'Spring Rolls',
//         description: 'Vegetable spring rolls with sweet chili sauce',
//         price: 5.99,
//         categoryId: appetizers.id,
//         isAvailable: true,
//         preparationTime: 12,
//       },
//       {
//         name: 'Nachos Supreme',
//         description: 'Tortilla chips with cheese, jalapeños, and salsa',
//         price: 9.99,
//         categoryId: appetizers.id,
//         isAvailable: true,
//         preparationTime: 10,
//       },
//     ],
//   })

//   // Main Course
//   await prisma.menuItem.createMany({
//     data: [
//       {
//         name: 'Classic Burger',
//         description: 'Juicy beef patty with lettuce, tomato, and cheese',
//         price: 12.99,
//         categoryId: mainCourse.id,
//         isAvailable: true,
//         preparationTime: 20,
//       },
//       {
//         name: 'Margherita Pizza',
//         description: 'Fresh mozzarella, tomato sauce, and basil',
//         price: 14.99,
//         categoryId: mainCourse.id,
//         isAvailable: true,
//         preparationTime: 25,
//       },
//       {
//         name: 'Grilled Chicken',
//         description: 'Marinated grilled chicken with vegetables',
//         price: 15.99,
//         categoryId: mainCourse.id,
//         isAvailable: true,
//         preparationTime: 30,
//       },
//       {
//         name: 'Spaghetti Carbonara',
//         description: 'Creamy pasta with bacon and parmesan',
//         price: 13.99,
//         categoryId: mainCourse.id,
//         isAvailable: true,
//         preparationTime: 20,
//       },
//       {
//         name: 'Fish and Chips',
//         description: 'Crispy battered fish with french fries',
//         price: 16.99,
//         categoryId: mainCourse.id,
//         isAvailable: true,
//         preparationTime: 25,
//       },
//       {
//         name: 'Beef Steak',
//         description: '8oz premium beef steak with mashed potatoes',
//         price: 24.99,
//         categoryId: mainCourse.id,
//         isAvailable: true,
//         preparationTime: 35,
//       },
//     ],
//   })

//   // Beverages
//   await prisma.menuItem.createMany({
//     data: [
//       {
//         name: 'Coca Cola',
//         description: 'Chilled Coca Cola',
//         price: 2.99,
//         categoryId: beverages.id,
//         isAvailable: true,
//         preparationTime: 2,
//       },
//       {
//         name: 'Fresh Orange Juice',
//         description: 'Freshly squeezed orange juice',
//         price: 4.99,
//         categoryId: beverages.id,
//         isAvailable: true,
//         preparationTime: 5,
//       },
//       {
//         name: 'Iced Coffee',
//         description: 'Cold brew coffee with ice',
//         price: 3.99,
//         categoryId: beverages.id,
//         isAvailable: true,
//         preparationTime: 5,
//       },
//       {
//         name: 'Mineral Water',
//         description: 'Bottled mineral water',
//         price: 1.99,
//         categoryId: beverages.id,
//         isAvailable: true,
//         preparationTime: 1,
//       },
//       {
//         name: 'Mango Smoothie',
//         description: 'Fresh mango blended smoothie',
//         price: 5.99,
//         categoryId: beverages.id,
//         isAvailable: true,
//         preparationTime: 5,
//       },
//     ],
//   })

//   // Desserts
//   await prisma.menuItem.createMany({
//     data: [
//       {
//         name: 'Chocolate Cake',
//         description: 'Rich chocolate cake with vanilla ice cream',
//         price: 6.99,
//         categoryId: desserts.id,
//         isAvailable: true,
//         preparationTime: 10,
//       },
//       {
//         name: 'Tiramisu',
//         description: 'Classic Italian coffee-flavored dessert',
//         price: 7.99,
//         categoryId: desserts.id,
//         isAvailable: true,
//         preparationTime: 5,
//       },
//       {
//         name: 'Ice Cream Sundae',
//         description: 'Three scoops with toppings',
//         price: 5.99,
//         categoryId: desserts.id,
//         isAvailable: true,
//         preparationTime: 5,
//       },
//       {
//         name: 'Apple Pie',
//         description: 'Warm apple pie with cinnamon',
//         price: 6.49,
//         categoryId: desserts.id,
//         isAvailable: true,
//         preparationTime: 8,
//       },
//     ],
//   })

//   // Salads
//   await prisma.menuItem.createMany({
//     data: [
//       {
//         name: 'Caesar Salad',
//         description: 'Romaine lettuce with Caesar dressing and croutons',
//         price: 8.99,
//         categoryId: salads.id,
//         isAvailable: true,
//         preparationTime: 10,
//       },
//       {
//         name: 'Greek Salad',
//         description: 'Fresh vegetables with feta cheese and olives',
//         price: 9.99,
//         categoryId: salads.id,
//         isAvailable: true,
//         preparationTime: 10,
//       },
//       {
//         name: 'Garden Salad',
//         description: 'Mixed greens with house dressing',
//         price: 7.99,
//         categoryId: salads.id,
//         isAvailable: true,
//         preparationTime: 8,
//       },
//     ],
//   })

//   console.log('✅ Created menu items')

//   // Seed Tables
//   await prisma.table.createMany({
//     data: [
//       { number: 1, capacity: 2, status: 'AVAILABLE' },
//       { number: 2, capacity: 2, status: 'AVAILABLE' },
//       { number: 3, capacity: 4, status: 'AVAILABLE' },
//       { number: 4, capacity: 4, status: 'AVAILABLE' },
//       { number: 5, capacity: 6, status: 'AVAILABLE' },
//       { number: 6, capacity: 6, status: 'AVAILABLE' },
//       { number: 7, capacity: 8, status: 'AVAILABLE' },
//       { number: 8, capacity: 4, status: 'AVAILABLE' },
//       { number: 9, capacity: 2, status: 'AVAILABLE' },
//       { number: 10, capacity: 4, status: 'AVAILABLE' },
//     ],
//   })

//   console.log('✅ Created tables')

//   // Seed Suppliers
//   const supplier1 = await prisma.supplier.create({
//     data: {
//       name: 'Fresh Foods Co.',
//       contact: 'John Smith',
//       email: 'contact@freshfoods.com',
//       phone: '+1234567890',
//       address: '123 Market Street, City, State 12345',
//     },
//   })

//   const supplier2 = await prisma.supplier.create({
//     data: {
//       name: 'Beverage Distributors Inc.',
//       contact: 'Jane Doe',
//       email: 'info@beveragedist.com',
//       phone: '+0987654321',
//       address: '456 Distribution Ave, City, State 12345',
//     },
//   })

//   console.log('✅ Created suppliers')

//   // Seed Inventory
//   await prisma.inventory.createMany({
//     data: [
//       {
//         name: 'Chicken Breast',
//         description: 'Fresh chicken breast',
//         quantity: 50,
//         unit: 'kg',
//         lowStockThreshold: 10,
//         costPerUnit: 8.5,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Beef Patties',
//         description: 'Premium beef patties',
//         quantity: 100,
//         unit: 'pieces',
//         lowStockThreshold: 20,
//         costPerUnit: 2.5,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Mozzarella Cheese',
//         description: 'Fresh mozzarella cheese',
//         quantity: 25,
//         unit: 'kg',
//         lowStockThreshold: 5,
//         costPerUnit: 12,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Tomatoes',
//         description: 'Fresh tomatoes',
//         quantity: 30,
//         unit: 'kg',
//         lowStockThreshold: 10,
//         costPerUnit: 3,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Lettuce',
//         description: 'Fresh lettuce',
//         quantity: 20,
//         unit: 'kg',
//         lowStockThreshold: 5,
//         costPerUnit: 2.5,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Coca Cola',
//         description: '500ml bottles',
//         quantity: 200,
//         unit: 'bottles',
//         lowStockThreshold: 50,
//         costPerUnit: 1.2,
//         supplierId: supplier2.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Orange Juice',
//         description: '1L cartons',
//         quantity: 50,
//         unit: 'cartons',
//         lowStockThreshold: 15,
//         costPerUnit: 3.5,
//         supplierId: supplier2.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Pasta',
//         description: 'Spaghetti pasta',
//         quantity: 40,
//         unit: 'kg',
//         lowStockThreshold: 10,
//         costPerUnit: 4,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Flour',
//         description: 'All-purpose flour',
//         quantity: 60,
//         unit: 'kg',
//         lowStockThreshold: 15,
//         costPerUnit: 2,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//       {
//         name: 'Potatoes',
//         description: 'Fresh potatoes for fries',
//         quantity: 80,
//         unit: 'kg',
//         lowStockThreshold: 20,
//         costPerUnit: 1.5,
//         supplierId: supplier1.id,
//         lastRestocked: new Date(),
//       },
//     ],
//   })

//   console.log('✅ Created inventory items')

//   // Seed Settings
//   await prisma.settings.create({
//     data: {
//       restaurantName: 'RestoPOS Restaurant',
//       address: '789 Main Street, Downtown, City 12345',
//       phone: '+1234567890',
//       email: 'info@restopos.com',
//       taxRate: 10.0,
//       currency: 'USD',
//       receiptHeader: 'Thank you for dining with us!',
//       receiptFooter: 'Visit us again soon!',
//     },
//   })

//   console.log('✅ Created settings')

//   console.log('🎉 Database seeding completed successfully!')
//   console.log('')
//   console.log('📋 Summary:')
//   console.log('   - 4 Users created (admin, manager, cashier, kitchen)')
//   console.log('   - 5 Categories created')
//   console.log('   - 26 Menu Items created')
//   console.log('   - 10 Tables created')
//   console.log('   - 2 Suppliers created')
//   console.log('   - 10 Inventory Items created')
//   console.log('   - 1 Settings record created')
//   console.log('')
//   console.log('🔑 Default Login:')
//   console.log('   Email: admin@restopos.com')
//   console.log('   Password: admin123')
// }

// main()
//   .catch((e) => {
//     console.error('❌ Error seeding database:', e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })

// prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.order.deleteMany()
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

  // ─── Users ────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@restopos.com', password: hashedPassword, role: 'ADMIN', isActive: true },
  })
  await prisma.user.create({
    data: { name: 'Manager', email: 'manager@restopos.com', password: hashedPassword, role: 'MANAGER', isActive: true },
  })
  await prisma.user.create({
    data: { name: 'Cashier', email: 'cashier@restopos.com', password: hashedPassword, role: 'CASHIER', isActive: true },
  })
  await prisma.user.create({
    data: { name: 'Kitchen Staff', email: 'kitchen@restopos.com', password: hashedPassword, role: 'KITCHEN', isActive: true },
  })

  console.log('✅ Created users (password: admin123)')

  // ─── Categories ───────────────────────────────────────────────────────────
  const biryani = await prisma.category.create({
    data: { name: 'Biryani', description: 'Aromatic rice dishes', sortOrder: 1, isActive: true },
  })
  const karahi = await prisma.category.create({
    data: { name: 'Karahi & Handi', description: 'Traditional wok-cooked dishes', sortOrder: 2, isActive: true },
  })
  const bbq = await prisma.category.create({
    data: { name: 'BBQ & Tikka', description: 'Grilled and marinated specialties', sortOrder: 3, isActive: true },
  })
  const fastFood = await prisma.category.create({
    data: { name: 'Fast Food', description: 'Burgers, sandwiches and more', sortOrder: 4, isActive: true },
  })
  const drinks = await prisma.category.create({
    data: { name: 'Drinks', description: 'Cold drinks, juices and shakes', sortOrder: 5, isActive: true },
  })
  const desserts = await prisma.category.create({
    data: { name: 'Desserts', description: 'Sweet treats and desserts', sortOrder: 6, isActive: true },
  })
  const naanRoti = await prisma.category.create({
    data: { name: 'Naan & Roti', description: 'Fresh breads from the tandoor', sortOrder: 7, isActive: true },
  })

  console.log('✅ Created categories')

  // ─── Menu Items ───────────────────────────────────────────────────────────

  // Biryani
  const biryaniItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Chicken Biryani', description: 'Aromatic basmati rice with spiced chicken', price: 350, categoryId: biryani.id, isAvailable: true, preparationTime: 20 } }),
    prisma.menuItem.create({ data: { name: 'Mutton Biryani', description: 'Slow-cooked mutton with fragrant rice', price: 550, categoryId: biryani.id, isAvailable: true, preparationTime: 25 } }),
    prisma.menuItem.create({ data: { name: 'Beef Biryani', description: 'Tender beef with spiced basmati rice', price: 420, categoryId: biryani.id, isAvailable: true, preparationTime: 20 } }),
    prisma.menuItem.create({ data: { name: 'Special Biryani', description: 'Mixed meat biryani with boiled egg', price: 650, categoryId: biryani.id, isAvailable: true, preparationTime: 25 } }),
  ])

  // Karahi & Handi
  const karahiItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Chicken Karahi', description: 'Tomato-based karahi with tender chicken', price: 850, categoryId: karahi.id, isAvailable: true, preparationTime: 30 } }),
    prisma.menuItem.create({ data: { name: 'Mutton Karahi', description: 'Rich mutton karahi cooked in traditional style', price: 1400, categoryId: karahi.id, isAvailable: true, preparationTime: 40 } }),
    prisma.menuItem.create({ data: { name: 'Beef Karahi', description: 'Spicy beef karahi with fresh ginger', price: 1100, categoryId: karahi.id, isAvailable: true, preparationTime: 35 } }),
    prisma.menuItem.create({ data: { name: 'Chicken Handi', description: 'Creamy white handi with tender chicken', price: 950, categoryId: karahi.id, isAvailable: true, preparationTime: 30 } }),
    prisma.menuItem.create({ data: { name: 'Daal Mash', description: 'Slow-cooked white lentils with butter', price: 350, categoryId: karahi.id, isAvailable: true, preparationTime: 20 } }),
  ])

  // BBQ & Tikka
  const bbqItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Chicken Tikka (6pcs)', description: 'Marinated chicken tikka grilled on charcoal', price: 650, categoryId: bbq.id, isAvailable: true, preparationTime: 25 } }),
    prisma.menuItem.create({ data: { name: 'Seekh Kebab (4pcs)', description: 'Minced beef kebabs with spices', price: 480, categoryId: bbq.id, isAvailable: true, preparationTime: 20 } }),
    prisma.menuItem.create({ data: { name: 'Boti Kebab (6pcs)', description: 'Tender mutton boti grilled to perfection', price: 750, categoryId: bbq.id, isAvailable: true, preparationTime: 25 } }),
    prisma.menuItem.create({ data: { name: 'Chapli Kebab (2pcs)', description: 'Peshwari-style flat beef kebabs', price: 380, categoryId: bbq.id, isAvailable: true, preparationTime: 15 } }),
    prisma.menuItem.create({ data: { name: 'Mix BBQ Platter', description: 'Assorted BBQ platter for 2', price: 1500, categoryId: bbq.id, isAvailable: true, preparationTime: 35 } }),
  ])

  // Fast Food
  const fastFoodItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Zinger Burger', description: 'Crispy chicken fillet burger with coleslaw', price: 450, categoryId: fastFood.id, isAvailable: true, preparationTime: 15 } }),
    prisma.menuItem.create({ data: { name: 'Beef Burger', description: 'Juicy beef patty with fresh veggies', price: 380, categoryId: fastFood.id, isAvailable: true, preparationTime: 12 } }),
    prisma.menuItem.create({ data: { name: 'Club Sandwich', description: 'Triple decker sandwich with chicken', price: 420, categoryId: fastFood.id, isAvailable: true, preparationTime: 10 } }),
    prisma.menuItem.create({ data: { name: 'Chicken Shawarma', description: 'Grilled chicken wrap with garlic sauce', price: 280, categoryId: fastFood.id, isAvailable: true, preparationTime: 10 } }),
    prisma.menuItem.create({ data: { name: 'French Fries (Large)', description: 'Crispy golden french fries', price: 220, categoryId: fastFood.id, isAvailable: true, preparationTime: 8 } }),
    prisma.menuItem.create({ data: { name: 'Chicken Nuggets (8pcs)', description: 'Golden fried chicken nuggets', price: 320, categoryId: fastFood.id, isAvailable: true, preparationTime: 10 } }),
  ])

  // Drinks
  const drinkItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Coca Cola', description: '330ml chilled can', price: 80, categoryId: drinks.id, isAvailable: true, preparationTime: 2 } }),
    prisma.menuItem.create({ data: { name: 'Mango Shake', description: 'Fresh mango blended with milk', price: 220, categoryId: drinks.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Strawberry Shake', description: 'Creamy strawberry milkshake', price: 220, categoryId: drinks.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Lassi (Sweet)', description: 'Traditional Pakistani sweet yogurt drink', price: 180, categoryId: drinks.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda', price: 150, categoryId: drinks.id, isAvailable: true, preparationTime: 3 } }),
    prisma.menuItem.create({ data: { name: 'Mineral Water', description: '500ml water bottle', price: 60, categoryId: drinks.id, isAvailable: true, preparationTime: 1 } }),
  ])

  // Desserts
  const dessertItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Gulab Jamun (4pcs)', description: 'Soft milk solids soaked in sugar syrup', price: 180, categoryId: desserts.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Kheer', description: 'Creamy rice pudding with cardamom', price: 200, categoryId: desserts.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Gajar Halwa', description: 'Carrot halwa with dry fruits', price: 220, categoryId: desserts.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Ice Cream (2 Scoops)', description: 'Choice of vanilla, chocolate or strawberry', price: 200, categoryId: desserts.id, isAvailable: true, preparationTime: 3 } }),
  ])

  // Naan & Roti
  const breadItems = await Promise.all([
    prisma.menuItem.create({ data: { name: 'Tandoori Naan', description: 'Fresh naan from the tandoor', price: 60, categoryId: naanRoti.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Butter Naan', description: 'Naan brushed with butter', price: 80, categoryId: naanRoti.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Roghni Naan', description: 'Sesame topped naan', price: 100, categoryId: naanRoti.id, isAvailable: true, preparationTime: 5 } }),
    prisma.menuItem.create({ data: { name: 'Chapati', description: 'Whole wheat flatbread', price: 30, categoryId: naanRoti.id, isAvailable: true, preparationTime: 3 } }),
    prisma.menuItem.create({ data: { name: 'Paratha', description: 'Layered flaky flatbread', price: 70, categoryId: naanRoti.id, isAvailable: true, preparationTime: 5 } }),
  ])

  console.log('✅ Created menu items (Pakistani menu)')

  // ─── Tables ───────────────────────────────────────────────────────────────
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

  // ─── Suppliers ────────────────────────────────────────────────────────────
  const supplier1 = await prisma.supplier.create({
    data: { name: 'Al-Fatah Foods', contact: 'Ahmed Khan', email: 'info@alfatah.com', phone: '+923001234567', address: 'Main Market, Lahore' },
  })
  const supplier2 = await prisma.supplier.create({
    data: { name: 'Pak Beverages', contact: 'Tariq Mehmood', email: 'info@pakbeverages.com', phone: '+923009876543', address: 'Industrial Area, Karachi' },
  })

  console.log('✅ Created suppliers')

  // ─── Inventory ────────────────────────────────────────────────────────────
  await prisma.inventory.createMany({
    data: [
      { name: 'Chicken (Fresh)', description: 'Fresh whole chicken', quantity: 50, unit: 'kg', lowStockThreshold: 10, costPerUnit: 480, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Mutton', description: 'Fresh mutton', quantity: 30, unit: 'kg', lowStockThreshold: 5, costPerUnit: 1600, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Beef (Mince)', description: 'Fresh beef mince', quantity: 25, unit: 'kg', lowStockThreshold: 5, costPerUnit: 900, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Basmati Rice', description: 'Long grain basmati rice', quantity: 100, unit: 'kg', lowStockThreshold: 20, costPerUnit: 220, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Tomatoes', description: 'Fresh tomatoes', quantity: 40, unit: 'kg', lowStockThreshold: 10, costPerUnit: 80, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Coca Cola (Cans)', description: '330ml cans', quantity: 300, unit: 'cans', lowStockThreshold: 50, costPerUnit: 50, supplierId: supplier2.id, lastRestocked: new Date() },
      { name: 'Cooking Oil', description: 'Sunflower cooking oil', quantity: 60, unit: 'liters', lowStockThreshold: 10, costPerUnit: 450, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Flour (Maida)', description: 'All purpose flour', quantity: 80, unit: 'kg', lowStockThreshold: 15, costPerUnit: 120, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Yogurt', description: 'Fresh dahi', quantity: 20, unit: 'kg', lowStockThreshold: 5, costPerUnit: 180, supplierId: supplier1.id, lastRestocked: new Date() },
      { name: 'Potatoes', description: 'Fresh potatoes', quantity: 60, unit: 'kg', lowStockThreshold: 15, costPerUnit: 60, supplierId: supplier1.id, lastRestocked: new Date() },
    ],
  })

  console.log('✅ Created inventory items')

  // ─── Settings ─────────────────────────────────────────────────────────────
  await prisma.settings.create({
    data: {
      restaurantName: 'Lahori Darbar Restaurant',
      address: 'Main Boulevard, Gulberg III, Lahore',
      phone: '+92-42-1234567',
      email: 'info@lahoridarbr.com',
      taxRate: 5.0,
      currency: 'PKR',
      receiptHeader: 'خوش آمدید - Welcome to Lahori Darbar',
      receiptFooter: 'Thank you! Please visit again | شکریہ',
    },
  })

  console.log('✅ Created settings')

  // ─── Seed Orders (Last 30 Days) ───────────────────────────────────────────
  const tables = await prisma.table.findMany()
  const allMenuItems = [
    ...biryaniItems, ...karahiItems, ...bbqItems,
    ...fastFoodItems, ...drinkItems, ...dessertItems, ...breadItems
  ]

  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'] as const
  const paymentMethods = ['CASH', 'CARD'] as const

  const customerNames = [
    'Ali Hassan', 'Sara Ahmed', 'Usman Khan', 'Fatima Malik',
    'Bilal Chaudhry', 'Ayesha Raza', 'Hamza Sheikh', 'Zara Butt',
    'Tariq Mehmood', 'Nadia Iqbal', 'Imran Siddiqui', 'Sana Riaz',
  ]

  const deliveryAddresses = [
    'House 12, Street 5, DHA Phase 1, Lahore',
    'Flat 3B, Gulberg Greens, Lahore',
    'Plot 45, Johar Town, Lahore',
    'House 7, Model Town, Lahore',
    'Room 204, Packages Mall Area, Lahore',
  ]

  let orderCount = 0

  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    // Weekends get more orders (5-8), weekdays get fewer (3-5)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Fri/Sat busy in Pakistan
    const ordersPerDay = isWeekend
      ? Math.floor(Math.random() * 4) + 5   // 5-8
      : Math.floor(Math.random() * 3) + 3   // 3-5

    for (let j = 0; j < ordersPerDay; j++) {
      // Random time during the day (11am - 11pm)
      const hour = Math.floor(Math.random() * 12) + 11
      const minute = Math.floor(Math.random() * 60)
      date.setHours(hour, minute, 0, 0)

      const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)]
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)]

      // Pick 1-4 random items
      const itemCount = Math.floor(Math.random() * 4) + 1
      const selectedItems = []
      for (let k = 0; k < itemCount; k++) {
        const item = allMenuItems[Math.floor(Math.random() * allMenuItems.length)]
        const quantity = Math.floor(Math.random() * 2) + 1
        selectedItems.push({ item, quantity })
      }

      const subtotal = selectedItems.reduce((sum, { item, quantity }) => sum + Number(item.price) * quantity, 0)
      const tax = Math.round(subtotal * 0.05 * 100) / 100   // 5% tax
      const deliveryFee = orderType === 'DELIVERY' ? 150 : 0  // Rs 150 delivery fee
      const total = subtotal + tax + deliveryFee

      await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          orderType,
          customerName: orderType !== 'DINE_IN' ? customerName : null,
          customerPhone: orderType !== 'DINE_IN' ? `+923${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}` : null,
          tableId: orderType === 'DINE_IN' ? tables[Math.floor(Math.random() * tables.length)].id : null,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddresses[Math.floor(Math.random() * deliveryAddresses.length)] : null,
          deliveryFee,
          subtotal,
          tax,
          discount: 0,
          total,
          status: 'COMPLETED',
          paymentMethod,
          paymentStatus: 'PAID',
          userId: admin.id,
          createdAt: new Date(date),
          orderItems: {
            create: selectedItems.map(({ item, quantity }) => ({
              menuItemId: item.id,
              quantity,
              price: Number(item.price),
              subtotal: Number(item.price) * quantity,
            }))
          }
        }
      })

      orderCount++
    }
  }

  console.log(`✅ Created ${orderCount} orders across last 30 days`)

  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log('   - 4 Users created (admin, manager, cashier, kitchen)')
  console.log('   - 7 Pakistani categories created')
  console.log('   - 34 Menu items with PKR pricing')
  console.log('   - 10 Tables created')
  console.log('   - 2 Suppliers created')
  console.log('   - 10 Inventory items created')
  console.log(`   - ${orderCount} orders across last 30 days`)
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