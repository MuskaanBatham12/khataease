import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const bill = await prisma.bill.findUnique({
      where: { publicToken: token },
      include: {
        shop: {
          select: {
            shopName: true,
            ownerName: true,
            phone: true,
            upiId: true,
          },
        },
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found or link expired" }, { status: 404 });
    }

    return NextResponse.json({ bill });
  } catch (error) {
    console.error("GET /api/b/[token] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
