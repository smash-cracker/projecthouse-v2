import { ProjectsProvider } from "@/components/providers/ProjectsProvider";
import { createPublicClient } from "@/utils/supabase/public";
import HomeClient from "./HomeClient";

// ISR: serve a cached homepage, refresh the catalog at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const supabase = createPublicClient();

  // Both lists are public and cached with the page, so fetch them in parallel
  // instead of letting Pricing load its bundles after hydration.
  const [{ data: projects }, { data: bundles }] = await Promise.all([
    supabase.from("projects").select("*").order("created_at", { ascending: false }),
    supabase.from("bundles").select("*").order("price", { ascending: true }),
  ]);

  return (
    <ProjectsProvider initialProjects={projects ?? []}>
      <HomeClient bundles={bundles ?? []} />
    </ProjectsProvider>
  );
}
