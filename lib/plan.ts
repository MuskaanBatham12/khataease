import { prisma } from "@/lib/prisma";

export const FREE_PLAN_CUSTOMER_LIMIT = 15;
export const FREE_PLAN_MONTHLY_BILL_LIMIT = 30;

export async function checkCustomerLimit(shopId: string): Promise<{ allowed: boolean; count: number; plan: string }> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { plan: true },
  });

  if (!shop) {
    return { allowed: false, count: 0, plan: "FREE" };
  }

  if (shop.plan === "PRO") {
    return { allowed: true, count: 0, plan: "PRO" };
  }

  const count = await prisma.customer.count({
    where: { shopId },
  });

  return {
    allowed: count < FREE_PLAN_CUSTOMER_LIMIT,
    count,
    plan: "FREE",
  };
}

export async function checkMonthlyBillLimit(shopId: string): Promise<{ allowed: boolean; count: number; plan: string }> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { plan: true },
  });

  if (!shop) {
    return { allowed: false, count: 0, plan: "FREE" };
  }

  if (shop.plan === "PRO") {
    return { allowed: true, count: 0, plan: "PRO" };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const count = await prisma.bill.count({
    where: {
      shopId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  return {
    allowed: count < FREE_PLAN_MONTHLY_BILL_LIMIT,
    count,
    plan: "FREE",
  };
}
