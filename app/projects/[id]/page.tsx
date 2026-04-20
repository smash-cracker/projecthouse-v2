import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Check purchase
  const { data: payment } = await supabase
    .from("payments")
    .select("id, created_at, amount, razorpay_payment_id")
    .eq("project_id", id)
    .maybeSingle();

  if (!payment) redirect("/");

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) redirect("/");

  return <ProjectDetailClient project={project} payment={payment} />;
}
