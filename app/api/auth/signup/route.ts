import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME, getCookieOptions } from "@/lib/auth";
import { signupSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { ownerName, shopName, phone, email, password, upiId, language } = validated.data;

    // Check existing shop phone
    const existingShop = await prisma.shop.findUnique({
      where: { phone },
    });

    if (existingShop) {
      return NextResponse.json(
        { error: "A shop with this phone number already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const shop = await prisma.shop.create({
      data: {
        ownerName,
        shopName,
        phone,
        email: email || null,
        passwordHash,
        upiId: upiId || null,
        language: language || "en",
        plan: "FREE",
      },
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

    const token = await signToken({
      shopId: shop.id,
      phone: shop.phone,
      shopName: shop.shopName,
    });

    const response = NextResponse.json(
      { message: "Shop created successfully", shop },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getCookieOptions());

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
