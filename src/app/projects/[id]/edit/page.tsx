import type { Metadata } from "next";
import EditProject from "@/views/EditProject";

export const metadata: Metadata = {
  title: "Editar projeto - Union Lab",
  robots: { index: false },
};

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditProject id={id} />;
}
