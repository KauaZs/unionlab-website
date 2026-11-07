import type { Metadata } from "next";
import PublishProject from "@/views/PublishProject";
import { PROJECT_TYPES } from "@/lib/projectTypes";
import type { ProjectType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Publicar projeto - Union Lab",
  description: "Envie seus sites, jogos e músicas para a comunidade Union Lab.",
};

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialType = PROJECT_TYPES.some((t) => t.id === type) ? (type as ProjectType) : null;
  return <PublishProject initialType={initialType} />;
}
