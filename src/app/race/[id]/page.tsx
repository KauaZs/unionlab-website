import { Metadata } from "next";
import RaceClient from "./RaceClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:80").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiUrl}/api/public/races/${id}`);
    if (!res.ok) throw new Error();
    const race = await res.json();

    return {
      title: `Duelo de Velocidade - Union Lab`,
      description: `Acompanhe a disputa ativa valendo Unicoins entre ${race.playerA.username} e ${race.playerB.username}!`,
      openGraph: {
        title: `Duelo de Velocidade - Union Lab`,
        description: `Acompanhe a disputa ativa valendo Unicoins entre ${race.playerA.username} e ${race.playerB.username}!`,
      },
    };
  } catch (e) {
    return {
      title: "Duelo de Velocidade - Union Lab",
      description: "Acompanhe disputas de velocidade entre membros da comunidade valendo Unicoins.",
    };
  }
}

export default async function RaceRoute({ params }: PageProps) {
  return <RaceClient params={params} />;
}
