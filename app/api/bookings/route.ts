import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST /api/bookings — create a booking (auth required)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { project_id, project_title, name, email, slot_date, slot_time } = body;

  if (!project_id || !project_title || !name || !email || !slot_date || !slot_time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check slot not already taken
  const { data: existing } = await supabase
    .from("demo_bookings")
    .select("id")
    .eq("project_id", project_id)
    .eq("slot_date", slot_date)
    .eq("slot_time", slot_time)
    .neq("status", "cancelled")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("demo_bookings")
    .insert({
      user_id: user.id,
      project_id,
      project_title,
      name,
      email,
      slot_date,
      slot_time,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data }, { status: 201 });
}

// GET /api/bookings?project_id=X&date=Y — return booked slots for availability
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const project_id = searchParams.get("project_id");
  const date = searchParams.get("date");

  if (!project_id || !date) {
    return NextResponse.json({ error: "Missing project_id or date" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("demo_bookings")
    .select("slot_time")
    .eq("project_id", project_id)
    .eq("slot_date", date)
    .neq("status", "cancelled");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const booked = (data || []).map((r) => r.slot_time);
  return NextResponse.json({ booked });
}
