import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations/biz";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const customer = await prisma.customer.findFirst({
      where: { id, shopId: session.shopId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Get all ledger entries chronologically
    const ledgers = await prisma.ledger.findMany({
      where: { shopId: session.shopId, customerId: id },
      orderBy: { createdAt: "asc" },
      include: {
        bill: {
          select: {
            id: true,
            number: true,
            status: true,
            publicToken: true,
          },
        },
      },
    });

    let runningBalance = 0;
    let totalBilled = 0;
    let totalPaid = 0;

    const timeline = ledgers.map((entry) => {
      if (entry.type === "BILL") {
        runningBalance += entry.amount;
        totalBilled += entry.amount;
      } else if (entry.type === "PAYMENT") {
        runningBalance -= entry.amount;
        totalPaid += entry.amount;
      }
      return {
        ...entry,
        runningBalance,
      };
    });

    return NextResponse.json({
      customer,
      timeline,
      summary: {
        totalBilled,
        totalPaid,
        currentBalance: runningBalance,
      },
    });
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = customerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findFirst({
      where: { id, shopId: session.shopId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const { name, phone, address } = validated.data;

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        address: address || null,
      },
    });

    return NextResponse.json({ customer: updated });
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.customer.findFirst({
      where: { id, shopId: session.shopId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/customers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
