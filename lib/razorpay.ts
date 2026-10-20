import Razorpay from "razorpay";

let client: Razorpay | null = null;

/** Lazily create the shared Razorpay client so routes that never take a
 *  payment don't need the keys at module-evaluation time. */
export function getRazorpay(): Razorpay {
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}
