import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordPaymentSchema } from "@/lib/validations/biz";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: billId } = await params;
    const body = await req.json();
    const validated = recordPaymentSchema.safeParse({ ...body, billId });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { customerId, amount, note } = validated.data;

    const bill = await prisma.bill.findFirst({
      where: { id: billId, shopId: session.shopId },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const newPaidAmount = bill.paidAmount + amount;
    let newStatus = "PARTIAL";
    if (newPaidAmount >= bill.total) {
      newStatus = "PAID";
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update bill paidAmount and status
      const updatedBill = await tx.bill.update({
        where: { id: billId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      // 2. Create Ledger entry (PAYMENT reduces customer balance)
      const ledger = await tx.ledger.create({
        data: {
          shopId: session.shopId,
          customerId,
          billId,
          type: "PAYMENT",
          amount,
          note: note || `Payment recorded for Bill #${bill.number}`,
        },
      });

      return { bill: updatedBill, ledger };
    });

    return NextResponse.json({ message: "Payment recorded successfully", data: result });
  } catch (error) {
    console.error("POST /api/bills/[id]/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
