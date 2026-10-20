import { ProjectsProvider } from "@/components/providers/ProjectsProvider";
import { createPublicClient } from "@/utils/supabase/public";
import HomeClient from "./HomeClient";

// ISR: serve a cached homepage, refresh the catalog at most once a minute.
export const revalidate = 60;

export default async function Home() {
  const supabase = createPublicClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <ProjectsProvider initialProjects={projects ?? []}>
      <HomeClient />
    </ProjectsProvider>
  );
}
