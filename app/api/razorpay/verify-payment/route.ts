import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRazorpay } from "@/lib/razorpay";

type VerifyBody = {
  razorpay_order_id?: unknown;
  razorpay_payment_id?: unknown;
  razorpay_signature?: unknown;
  project_id?: unknown;
  project_title?: unknown;
  amount?: unknown;
};

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function POST(request: NextRequest) {
  let body: VerifyBody;
  try {
    body = (await request.json()) as VerifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = readString(body.razorpay_order_id);
  const paymentId = readString(body.razorpay_payment_id);
  const signature = readString(body.razorpay_signature);

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  // Get logged-in user before doing any Razorpay work.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify signature
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");
  const signatureValid =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!signatureValid) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  // The order notes are written by create-order, so project and amount are
  // server-derived. Reading them back stops a client from claiming a different
  // (more expensive) project when saving the payment record.
  let projectId = readString(body.project_id);
  let projectTitle = readString(body.project_title);
  let amount = typeof body.amount === "number" ? body.amount : 0;

  try {
    const order = await getRazorpay().orders.fetch(orderId);
    const notes = (order.notes ?? {}) as Record<string, unknown>;

    const orderUserId = readString(notes.user_id);
    if (orderUserId && orderUserId !== user.id) {
      return NextResponse.json(
        { error: "This order belongs to another account" },
        { status: 403 }
      );
    }

    projectId = readString(notes.project_id) ?? projectId;
    projectTitle = readString(notes.project_title) ?? projectTitle;
    amount = typeof order.amount === "number" ? order.amount : amount;
  } catch (err) {
    // Transient Razorpay failure: the signature is already valid and the money
    // has moved, so record the best data we have rather than blocking access.
    console.error("Failed to load Razorpay order:", err);
  }

  // Save payment record
  const { error: dbError } = await supabase.from("payments").insert({
    user_id: user.id,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
    project_id: projectId,
    project_title: projectTitle,
    amount,
    currency: "INR",
    status: "paid",
  });

  if (dbError) {
    console.error("Failed to save payment:", dbError.message);
    // Still return verified — money already moved, don't block the user
    return NextResponse.json({ verified: true, payment_id: paymentId, saved: false });
  }

  return NextResponse.json({ verified: true, payment_id: paymentId, saved: true });
}
