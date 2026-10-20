"use client";

import React, { createContext, useContext, useMemo } from "react";

interface ProjectsState {
  projects: any[];
  projectsLoading: boolean;
}

const ProjectsContext = createContext<ProjectsState | undefined>(undefined);

/**
 * Holds the catalog fetched on the server and passed into the page.
 * Kept separate from ThemeProvider so opening a modal or toggling auth
 * doesn't re-render unrelated UI with the project list.
 */
export function ProjectsProvider({
  children,
  initialProjects = [],
}: {
  children: React.ReactNode;
  initialProjects?: any[];
}) {
  const value = useMemo(
    () => ({ projects: initialProjects, projectsLoading: false }),
    [initialProjects]
  );

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
