import { Metadata } from "next";
import CodeDetailClient from "./CodeDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:80").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiUrl}/api/public/codes/${id}`);
    if (!res.ok) throw new Error();
    const code = await res.json();

    return {
      title: `${code.title} - codes - Union Lab`,
      description: `Código em ${code.language} criado por ${code.authorName}. Preço: ${code.price <= 0 ? "Gratuito" : `${code.price} Unicoins`}.`,
    };
  } catch (e) {
    return {
      title: "codes - Union Lab",
      description: "Detalhes do snippet de código no Union Lab.",
    };
  }
}

export default async function CodeDetailPage({ params }: PageProps) {
  return <CodeDetailClient params={params} />;
}
