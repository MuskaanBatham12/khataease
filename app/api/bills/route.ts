import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBillSchema } from "@/lib/validations/biz";
import { checkMonthlyBillLimit } from "@/lib/plan";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const bills = await prisma.bill.findMany({
      where: {
        shopId: session.shopId,
        ...(customerId ? { customerId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bills });
  } catch (error) {
    console.error("GET /api/bills error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check FREE Plan Monthly Bill Limit (30 bills/month)
    const limitCheck = await checkMonthlyBillLimit(session.shopId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "PLAN_LIMIT_REACHED",
          message: "Free plan monthly bill limit reached (30 bills/month). Upgrade to Pro for unlimited bills.",
          limit: "BILLS",
          count: limitCheck.count,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = createBillSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customerId, items, total, paidAmount, note } = validated.data;

    // Verify customer belongs to this shop
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, shopId: session.shopId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Generate unique bill number (KH-XXXX)
    const totalBillsForShop = await prisma.bill.count({
      where: { shopId: session.shopId },
    });
    const billNumber = `KH-${String(totalBillsForShop + 1001).padStart(4, "0")}`;

    // Unguessable token
    const publicToken = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;

    // Determine status
    let status = "UNPAID";
    if (paidAmount >= total) {
      status = "PAID";
    } else if (paidAmount > 0) {
      status = "PARTIAL";
    }

    // Execute in Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Bill & BillItems
      const newBill = await tx.bill.create({
        data: {
          shopId: session.shopId,
          customerId,
          number: billNumber,
          total,
          paidAmount,
          status,
          publicToken,
          items: {
            create: items.map((item) => ({
              name: item.name,
              qty: item.qty,
              price: item.price,
            })),
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // 2. Create Ledger entry for Bill (BILL adds to customer balance)
      await tx.ledger.create({
        data: {
          shopId: session.shopId,
          customerId,
          billId: newBill.id,
          type: "BILL",
          amount: total,
          note: note || `Bill #${billNumber}`,
        },
      });

      // 3. If partial/full payment was made at creation time, create PAYMENT ledger entry
      if (paidAmount > 0) {
        await tx.ledger.create({
          data: {
            shopId: session.shopId,
            customerId,
            billId: newBill.id,
            type: "PAYMENT",
            amount: paidAmount,
            note: `Initial payment for Bill #${billNumber}`,
          },
        });
      }

      return newBill;
    });

    return NextResponse.json({ bill: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bills error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
