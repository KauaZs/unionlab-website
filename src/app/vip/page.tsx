import { Metadata } from "next";
import VipClient from "./VipClient";

export const metadata: Metadata = {
  title: "Assinatura VIP - Union Lab",
  description: "Seja um apoiador VIP do Union Lab! Ganhe multiplicador de votos, medalhas exclusivas e destaque na listagem de bots.",
  openGraph: {
    title: "Assinatura VIP - Union Lab",
    description: "Seja um apoiador VIP do Union Lab! Ganhe multiplicador de votos, medalhas exclusivas e destaque na listagem de bots.",
  },
};

export default function VipRoute() {
  return <VipClient />;
}
