import type { Metadata } from "next";
import ProjectDetail from "@/views/ProjectDetail";
import { fetchJson, getServerApiUrl } from "@/lib/api";
import { PROJECT_TYPE_BY_ID } from "@/lib/projectTypes";
import type { Project } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const project = await fetchJson<Project>(`${getServerApiUrl()}/api/public/projects/${id}`, { next: { revalidate: 60 } });
    const title = `${project.title} - ${PROJECT_TYPE_BY_ID[project.type].label} no Union Lab`;
    const images = project.coverImage ? [project.coverImage] : [];
    return {
      title,
      description: project.summary,
      openGraph: { title, description: project.summary, images },
      twitter: { card: project.coverImage ? "summary_large_image" : "summary", title, description: project.summary, images },
    };
  } catch {
    return { title: "Projeto - Union Lab", description: "Projetos da comunidade Union Lab." };
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
