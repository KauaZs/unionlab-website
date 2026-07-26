import { Metadata } from "next";
import Leaderboard from "@/views/Leaderboard";

export const metadata: Metadata = {
  title: "Rankings & Leaderboard - Union Lab",
  description: "Confira o ranking dos bots mais votados e a tabela de liderança dos membros com mais Unicoins da comunidade.",
  openGraph: {
    title: "Rankings & Leaderboard - Union Lab",
    description: "Confira o ranking dos bots mais votados e a tabela de liderança dos membros com mais Unicoins da comunidade.",
  },
};

export default function RankingsRoute() {
  return <Leaderboard />;
}
