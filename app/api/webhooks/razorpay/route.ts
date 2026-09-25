import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(textBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(textBody);

    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity;
      const orderId = paymentData.order_id;
      const paymentId = paymentData.id;

      const paymentRecord = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (paymentRecord && paymentRecord.status !== "SUCCESS") {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { razorpayOrderId: orderId },
            data: {
              razorpayPaymentId: paymentId,
              status: "SUCCESS",
            },
          });

          await tx.shop.update({
            where: { id: paymentRecord.shopId },
            data: { plan: "PRO" },
          });
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
