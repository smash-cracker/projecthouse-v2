"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface RazorpayButtonProps {
  /** Amount in paise (e.g. 50000 = ₹500) */
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  /** Customer details for prefill */
  prefill?: { name?: string; email?: string; contact?: string };
  /** Called with verified payment_id on success */
  onSuccess?: (paymentId: string, orderId: string) => void;
  onFailure?: (error: unknown) => void;
  children?: React.ReactNode;
  className?: string;
}

export default function RazorpayButton({
  amount,
  currency = "INR",
  name,
  description,
  prefill,
  onSuccess,
  onFailure,
  children = "Pay Now",
  className,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { scriptLoaded.current = true; };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });

      const { order, error } = await res.json();
      if (error) throw new Error(error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name,
        description,
        order_id: order.id,
        prefill,
        theme: { color: "#2563EB" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.verified) {
            onSuccess?.(verifyData.payment_id, response.razorpay_order_id);
          } else {
            onFailure?.(new Error(verifyData.error ?? "Signature verification failed"));
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res: { error: unknown }) => {
        onFailure?.(res.error);
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      onFailure?.(err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? "Processing…" : children}
    </button>
  );
}
