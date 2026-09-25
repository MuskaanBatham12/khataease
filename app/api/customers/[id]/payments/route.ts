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

    const { id: customerId } = await params;
    const body = await req.json();
    const validated = recordPaymentSchema.safeParse({ ...body, customerId });

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation error", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, note, billId } = validated.data;

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, shopId: session.shopId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create Ledger entry (PAYMENT reduces customer balance)
      const ledger = await tx.ledger.create({
        data: {
          shopId: session.shopId,
          customerId,
          billId: billId || null,
          type: "PAYMENT",
          amount,
          note: note || `Payment received from ${customer.name}`,
        },
      });

      // If linked to a bill, update the bill's paidAmount & status
      if (billId) {
        const bill = await tx.bill.findUnique({ where: { id: billId } });
        if (bill) {
          const newPaidAmount = bill.paidAmount + amount;
          const newStatus = newPaidAmount >= bill.total ? "PAID" : "PARTIAL";
          await tx.bill.update({
            where: { id: billId },
            data: {
              paidAmount: newPaidAmount,
              status: newStatus,
            },
          });
        }
      }

      return ledger;
    });

    return NextResponse.json({ message: "Payment recorded successfully", ledger: result }, { status: 201 });
  } catch (error) {
    console.error("POST /api/customers/[id]/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
