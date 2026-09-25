import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Total Udhaar Pending (sum of all ledgers: BILL is +, PAYMENT is -)
    const ledgers = await prisma.ledger.findMany({
      where: { shopId: session.shopId },
    });

    let totalPending = 0;
    ledgers.forEach((l) => {
      if (l.type === "BILL") totalPending += l.amount;
      else if (l.type === "PAYMENT") totalPending -= l.amount;
    });

    // 2. Today's Sales
    const todaysBills = await prisma.bill.aggregate({
      where: {
        shopId: session.shopId,
        createdAt: { gte: today },
      },
      _sum: { total: true },
    });
    const todaySales = todaysBills._sum.total || 0;

    // 3. This month's collection
    const monthPayments = await prisma.ledger.aggregate({
      where: {
        shopId: session.shopId,
        type: "PAYMENT",
        createdAt: { gte: firstDayOfMonth },
      },
      _sum: { amount: true },
    });
    const monthCollection = monthPayments._sum.amount || 0;

    // 4. Top 5 customers owing most
    const customers = await prisma.customer.findMany({
      where: { shopId: session.shopId },
      include: { ledgers: true },
    });

    const customersWithBalance = customers.map((c) => {
      let bal = 0;
      c.ledgers.forEach((l) => {
        if (l.type === "BILL") bal += l.amount;
        else if (l.type === "PAYMENT") bal -= l.amount;
      });
      return { id: c.id, name: c.name, phone: c.phone, balance: bal };
    });

    const topCustomers = customersWithBalance
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 5);

    // 5. 6-Month Chart Data
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

      const mSales = await prisma.bill.aggregate({
        where: { shopId: session.shopId, createdAt: { gte: start, lte: end } },
        _sum: { total: true },
      });

      const mColl = await prisma.ledger.aggregate({
        where: { shopId: session.shopId, type: "PAYMENT", createdAt: { gte: start, lte: end } },
        _sum: { amount: true },
      });

      chartData.push({
        name: start.toLocaleString("default", { month: "short" }),
        sales: (mSales._sum.total || 0) / 100, // convert to rupees for chart
        collection: (mColl._sum.amount || 0) / 100,
      });
    }

    return NextResponse.json({
      totalPending,
      todaySales,
      monthCollection,
      topCustomers,
      chartData,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
