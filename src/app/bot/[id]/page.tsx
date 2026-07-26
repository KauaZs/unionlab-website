import { Metadata } from "next";
import BotDetailClient from "./BotDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:80").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiUrl}/api/public/bots/${id}`);
    if (!res.ok) throw new Error();
    const bot = await res.json();

    const avatarUrl = bot.avatar
      ? `https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    return {
      title: `${bot.username} - Bot no Union Lab`,
      description: bot.description || `Veja detalhes, avaliações e vote no bot ${bot.username} no Union Lab!`,
      openGraph: {
        title: `${bot.username} - Bot no Union Lab`,
        description: bot.description || `Veja detalhes, avaliações e vote no bot ${bot.username} no Union Lab!`,
        images: [avatarUrl],
      },
      twitter: {
        card: "summary",
        title: `${bot.username} - Bot no Union Lab`,
        description: bot.description || `Veja detalhes, avaliações e vote no bot ${bot.username} no Union Lab!`,
        images: [avatarUrl],
      },  
    };
  } catch (e) {
    return {
      title: "Bot - Union Lab",
      description: "Detalhes do bot no Union Lab.",
    };
  }
}

export default async function BotDetailPage({ params }: PageProps) {
  return <BotDetailClient params={params} />;
}
