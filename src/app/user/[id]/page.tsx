import { Metadata } from "next";
import UserProfileClient from "./UserProfileClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:80").replace(/\/$/, "");
  try {
    const res = await fetch(`${apiUrl}/api/public/users/${id}`);
    if (!res.ok) throw new Error();
    const user = await res.json();

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    return {
      title: `${user.username} - Perfil no Union Lab`,
      description: user.aboutme || `Veja o perfil de ${user.username} no Union Lab.`,
      openGraph: {
        title: `${user.username} - Perfil no Union Lab`,
        description: user.aboutme || `Veja o perfil de ${user.username} no Union Lab.`,
        images: [avatarUrl],
      },
    };
  } catch (e) {
    return {
      title: "Perfil - Union Lab",
      description: "Veja o perfil de desenvolvedores no Union Lab.",
    };
  }
}

export default async function UserProfileRoute({ params }: PageProps) {
  return <UserProfileClient params={params} />;
}
