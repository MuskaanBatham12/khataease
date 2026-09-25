import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const amount = 19900; // 199 INR in paise for PRO plan

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${session.shopId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await prisma.payment.create({
      data: {
        shopId: session.shopId,
        razorpayOrderId: order.id,
        amount,
        status: "PENDING",
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Could not create Razorpay order" }, { status: 500 });
  }
}
