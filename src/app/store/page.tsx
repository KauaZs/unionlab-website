import { Metadata } from "next";
import StoreClient from "./StoreClient";

export const metadata: Metadata = {
  title: "Loja de Unicoins - Union Lab",
  description: "Use suas Unicoins para comprar destaques no outdoor, cores personalizadas para seu perfil e muito mais!",
  openGraph: {
    title: "Loja de Unicoins - Union Lab",
    description: "Use suas Unicoins para comprar destaques no outdoor, cores personalizadas para seu perfil e muito mais!",
  },
};

export default function StoreRoute() {
  return <StoreClient />;
}
