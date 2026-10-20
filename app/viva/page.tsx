import { createPublicClient } from "@/utils/supabase/public";
import VivaClient from "./VivaClient";

// The Q&A list is public and changes rarely, so render it on the server and
// cache it with the page. Only the chat and per-user purchases stay client-side.
export const revalidate = 300;

export default async function VivaPage() {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("viva_qa")
    .select("id, question, answer, order_index, cat")
    .order("order_index", { ascending: true });

  return <VivaClient initialQa={data ?? []} />;
}
