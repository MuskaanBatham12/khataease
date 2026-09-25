import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/biz";
import { checkCustomerLimit } from "@/lib/plan";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const customers = await prisma.customer.findMany({
      where: {
        shopId: session.shopId,
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
              ],
            }
          : {}),
      },
      include: {
        ledgers: {
          select: {
            type: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate pending balance for each customer (BILL adds, PAYMENT subtracts)
    const formattedCustomers = customers.map((customer) => {
      let balance = 0;
      for (const entry of customer.ledgers) {
        if (entry.type === "BILL") {
          balance += entry.amount;
        } else if (entry.type === "PAYMENT") {
          balance -= entry.amount;
        }
      }

      const { ledgers, ...rest } = customer;
      return {
        ...rest,
        balance, // balance in paise
      };
    });

    return NextResponse.json({ customers: formattedCustomers });
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Plan Limits (Free = 15 customers)
    const limitCheck = await checkCustomerLimit(session.shopId);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: "PLAN_LIMIT_REACHED",
          message: "Free plan customer limit reached (max 15 customers). Upgrade to Pro for unlimited customers.",
          limit: "CUSTOMERS",
          count: limitCheck.count,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = customerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, phone, address } = validated.data;

    const customer = await prisma.customer.create({
      data: {
        shopId: session.shopId,
        name,
        phone,
        address: address || null,
      },
    });

    return NextResponse.json({ customer, balance: 0 }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
