import { Metadata } from "next";
import HelpFAQ from "@/views/HelpFAQ";

export const metadata: Metadata = {
  title: "Ajuda & FAQ - Union Lab",
  description: "Dúvidas frequentes sobre como adicionar bots, sistema de Unicoins, votos e regras do Union Lab.",
  openGraph: {
    title: "Ajuda & FAQ - Union Lab",
    description: "Dúvidas frequentes sobre como adicionar bots, sistema de Unicoins, votos e regras do Union Lab.",
  },
};

export default function HelpRoute() {
  return <HelpFAQ />;
}
