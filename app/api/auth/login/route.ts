import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, AUTH_COOKIE_NAME, getCookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { phone, password } = validated.data;

    const shop = await prisma.shop.findUnique({
      where: { phone },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, shop.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      shopId: shop.id,
      phone: shop.phone,
      shopName: shop.shopName,
    });

    const safeShop = {
      id: shop.id,
      ownerName: shop.ownerName,
      shopName: shop.shopName,
      phone: shop.phone,
      email: shop.email,
      upiId: shop.upiId,
      plan: shop.plan,
      language: shop.language,
      createdAt: shop.createdAt,
    };

    const response = NextResponse.json({
      message: "Login successful",
      shop: safeShop,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getCookieOptions());

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
