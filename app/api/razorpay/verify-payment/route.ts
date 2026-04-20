import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    project_id,
    project_title,
    amount,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  // Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // Get logged-in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Save payment record
  const { error: dbError } = await supabase.from("payments").insert({
    user_id: user.id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    project_id: project_id ?? null,
    project_title: project_title ?? null,
    amount: amount ?? 0,
    currency: "INR",
    status: "paid",
  });

  if (dbError) {
    console.error("Failed to save payment:", dbError.message);
    // Still return verified — money already moved, don't block the user
    return NextResponse.json({ verified: true, payment_id: razorpay_payment_id, saved: false });
  }

  return NextResponse.json({ verified: true, payment_id: razorpay_payment_id, saved: true });
}
