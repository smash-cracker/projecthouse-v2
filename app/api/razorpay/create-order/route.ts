import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getRazorpay } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

type Addon = { name?: unknown; price?: unknown };

type CreateOrderBody = {
  project_id?: unknown;
  addons?: unknown;
  amount?: unknown;
  currency?: unknown;
  receipt?: unknown;
};

export async function POST(request: NextRequest) {
  let body: CreateOrderBody;
  try {
    body = (await request.json()) as CreateOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Only signed-in buyers can create orders; the payment record is attached to
  // this user afterwards.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Orders are cheap but not free; stop a retry loop from hammering Razorpay.
  const orderLimit = rateLimit(`order:${user.id}`, 10, 60_000);
  if (!orderLimit.ok) {
    return NextResponse.json(
      { error: "Too many payment attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(orderLimit.retryAfter) } }
    );
  }

  const { project_id, addons, amount: clientAmount, currency, receipt } = body;

  if (typeof project_id !== "string" || !project_id) {
    return NextResponse.json({ error: "project_id is required" }, { status: 400 });
  }
  if (currency !== undefined && currency !== "INR") {
    return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
  }
  if (
    addons !== undefined &&
    (!Array.isArray(addons) || addons.some((name) => typeof name !== "string"))
  ) {
    return NextResponse.json(
      { error: "addons must be an array of add-on names" },
      { status: 400 }
    );
  }

  // Never trust the amount from the client: look the project (and its add-on
  // prices) up server-side and build the order from that.
  const { data: project, error } = await supabase
    .from("projects")
    .select("id, title, price, includes")
    .eq("id", project_id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load project for order:", error.message);
    return NextResponse.json({ error: "Could not load project" }, { status: 500 });
  }
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const includes: Addon[] = Array.isArray(project.includes) ? project.includes : [];
  const basePrice = Number(project.price);
  let priceInRupees: number;

  if (includes.length === 0) {
    priceInRupees = basePrice;
  } else {
    const selected = new Set(
      Array.isArray(addons)
        ? (addons as string[])
        : includes.map((item) => String(item?.name ?? ""))
    );
    const known = new Set(includes.map((item) => String(item?.name ?? "")));

    for (const name of selected) {
      if (!known.has(name)) {
        return NextResponse.json(
          { error: `Unknown add-on: ${name}` },
          { status: 400 }
        );
      }
    }

    const selectedTotal = includes.reduce(
      (sum, item) =>
        selected.has(String(item?.name ?? "")) ? sum + Number(item?.price ?? 0) : sum,
      0
    );

    // Mirrors the drawer: if everything is deselected, fall back to the listed
    // project price rather than creating a zero-rupee order.
    priceInRupees = selectedTotal || basePrice;
  }

  if (!Number.isFinite(priceInRupees) || priceInRupees <= 0) {
    return NextResponse.json(
      { error: "Project price is unavailable" },
      { status: 409 }
    );
  }

  const amount = Math.round(priceInRupees * 100);
  if (amount < 100) {
    return NextResponse.json({ error: "Invalid project price" }, { status: 400 });
  }

  if (
    clientAmount !== undefined &&
    (typeof clientAmount !== "number" || Math.round(clientAmount) !== amount)
  ) {
    return NextResponse.json(
      {
        error: "Amount does not match the current project price",
        amount,
      },
      { status: 400 }
    );
  }

  const safeReceipt =
    typeof receipt === "string" && receipt.length <= 40
      ? receipt
      : `receipt_${Date.now()}`;

  try {
    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: safeReceipt,
      // The notes are the authoritative record verify-payment reads back, so
      // the client cannot claim a different project when saving the payment.
      notes: {
        project_id: project.id,
        project_title: project.title ?? "",
        user_id: user.id,
      },
    });

    return NextResponse.json({ order });
  } catch (err) {
    console.error("Failed to create Razorpay order:", err);
    return NextResponse.json(
      { error: "Could not create payment order" },
      { status: 502 }
    );
  }
}
