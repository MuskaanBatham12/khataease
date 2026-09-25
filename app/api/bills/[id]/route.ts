import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const bill = await prisma.bill.findFirst({
      where: { id, shopId: session.shopId },
      include: {
        shop: {
          select: {
            id: true,
            shopName: true,
            ownerName: true,
            phone: true,
            upiId: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        items: true,
        ledgers: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    return NextResponse.json({ bill });
  } catch (error) {
    console.error("GET /api/bills/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
