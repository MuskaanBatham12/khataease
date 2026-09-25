import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({
      where: { id: session.shopId },
      select: {
        id: true,
        ownerName: true,
        shopName: true,
        phone: true,
        email: true,
        upiId: true,
        plan: true,
        language: true,
        createdAt: true,
      },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
