import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { amount, currency = "INR", receipt, notes } = body;

  if (!amount || typeof amount !== "number" || amount < 100) {
    return NextResponse.json(
      { error: "Invalid amount. Must be a number >= 100 (in paise)" },
      { status: 400 }
    );
  }

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: receipt ?? `receipt_${Date.now()}`,
    notes: notes ?? {},
  });

  return NextResponse.json({ order });
}
