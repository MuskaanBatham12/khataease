import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.ledger.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.item.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shop.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Create Demo Shop
  const shop = await prisma.shop.create({
    data: {
      ownerName: "Ramesh Kumar",
      shopName: "Ramesh Kirana Store",
      phone: "9876543210",
      email: "ramesh.kirana@example.com",
      passwordHash,
      upiId: "rameshstore@upi",
      plan: "PRO",
      language: "en",
    },
  });

  console.log(`Created shop: ${shop.shopName} (${shop.phone})`);

  // 2. Create Items (amounts in paise)
  const itemsData = [
    { name: "Aashirvaad Atta 5kg", price: 24000 },
    { name: "Fortune Oil 1L", price: 13500 },
    { name: "Tata Salt 1kg", price: 2800 },
    { name: "Amul Butter 500g", price: 27500 },
    { name: "Taza Tea 250g", price: 11000 },
    { name: "Maggi 4-pack", price: 5600 },
    { name: "Sugar 1kg", price: 4400 },
    { name: "Basmati Rice 5kg", price: 45000 },
    { name: "Surf Excel 1kg", price: 14000 },
    { name: "Dettol Soap 3-pack", price: 12000 },
  ];

  for (const item of itemsData) {
    await prisma.item.create({
      data: {
        shopId: shop.id,
        name: item.name,
        price: item.price,
      },
    });
  }

  // 3. Create Customers
  const customersData = [
    { name: "Rajesh Sharma", phone: "9811122233", address: "Sector 14, Main Market" },
    { name: "Sunita Verma", phone: "9822233344", address: "House 45, Near Temple" },
    { name: "Amit Patel", phone: "9833344455", address: "Flat 202, Sunshine Apts" },
    { name: "Vikram Singh", phone: "9844455566", address: "Shop 12, Civil Lines" },
    { name: "Priya Nair", phone: "9855566677", address: "Block B-4, Model Town" },
    { name: "Anish Gupta", phone: "9866677788", address: "A-12, Green Park" },
    { name: "Meena Devi", phone: "9877788899", address: "Near Water Tank, Village Rd" },
    { name: "Suresh Yadav", phone: "9888899900", address: "House 88, Railway Colony" },
    { name: "Kavita Joshi", phone: "9899900011", address: "C-301, Royal Heights" },
    { name: "Manoj Tiwari", phone: "9800011122", address: "Plot 5, Industrial Area" },
  ];

  const createdCustomers = [];
  for (const cust of customersData) {
    const c = await prisma.customer.create({
      data: {
        shopId: shop.id,
        name: cust.name,
        phone: cust.phone,
        address: cust.address,
      },
    });
    createdCustomers.push(c);
  }

  console.log(`Created ${createdCustomers.length} customers.`);

  // 4. Generate historical bills and payments across last 6 months
  const now = new Date();
  let billCounter = 1001;

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 10);

    for (let i = 0; i < createdCustomers.length; i++) {
      const customer = createdCustomers[i];

      // Create 1-2 bills per customer per month
      const totalPaise = (Math.floor(Math.random() * 30) + 10) * 10000; // Rs 1000 to Rs 4000
      const paidPaise =
        i % 3 === 0
          ? totalPaise // fully paid
          : i % 3 === 1
          ? Math.floor(totalPaise * 0.4) // partial
          : 0; // unpaid

      const status =
        paidPaise >= totalPaise ? "PAID" : paidPaise > 0 ? "PARTIAL" : "UNPAID";

      const billNumber = `KH-${billCounter++}`;
      const publicToken = `tok_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

      const billDate = new Date(targetMonth);
      billDate.setDate(Math.floor(Math.random() * 20) + 1);

      const bill = await prisma.bill.create({
        data: {
          shopId: shop.id,
          customerId: customer.id,
          number: billNumber,
          total: totalPaise,
          paidAmount: paidPaise,
          status,
          publicToken,
          createdAt: billDate,
          items: {
            create: [
              { name: "Grocery Items", qty: 1, price: Math.floor(totalPaise * 0.6) },
              { name: "Household Goods", qty: 1, price: Math.ceil(totalPaise * 0.4) },
            ],
          },
        },
      });

      // Ledger entry for Bill
      await prisma.ledger.create({
        data: {
          shopId: shop.id,
          customerId: customer.id,
          billId: bill.id,
          type: "BILL",
          amount: totalPaise,
          note: `Bill #${billNumber}`,
          createdAt: billDate,
        },
      });

      // Ledger entry for Payment if any payment made
      if (paidPaise > 0) {
        const paymentDate = new Date(billDate);
        paymentDate.setHours(paymentDate.getHours() + 2);

        await prisma.ledger.create({
          data: {
            shopId: shop.id,
            customerId: customer.id,
            billId: bill.id,
            type: "PAYMENT",
            amount: paidPaise,
            note: `Payment for Bill #${billNumber}`,
            createdAt: paymentDate,
          },
        });
      }
    }
  }

  // 5. Seed Pro Subscription Payment record
  await prisma.payment.create({
    data: {
      shopId: shop.id,
      razorpayOrderId: "order_demo_123456",
      razorpayPaymentId: "pay_demo_987654",
      amount: 19900, // Rs 199
      status: "SUCCESS",
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
