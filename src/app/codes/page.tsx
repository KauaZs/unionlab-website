import { Metadata } from "next";
import CodesClient from "./CodesClient";

export const metadata: Metadata = {
  title: "codes - Snippets da Comunidade - Union Lab",
  description: "Explore e compartilhe trechos de código úteis criados pela nossa comunidade. Use seus Unicoins para adquirir códigos premium.",
  openGraph: {
    title: "codes - Snippets da Comunidade - Union Lab",
    description: "Explore e compartilhe trechos de código úteis criados pela nossa comunidade. Use seus Unicoins para adquirir códigos premium.",
  },
};

export default function CodesRoute() {
  return <CodesClient />;
}
