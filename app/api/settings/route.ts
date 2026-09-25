import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { upiId, language } = body;

    const updated = await prisma.shop.update({
      where: { id: session.shopId },
      data: {
        ...(upiId !== undefined && { upiId }),
        ...(language !== undefined && { language }),
      },
    });

    return NextResponse.json({ shop: updated });
  } catch (error) {
    console.error("Settings API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
