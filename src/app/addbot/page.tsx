import { Metadata } from "next";
import AddBotClient from "./AddBotClient";

export const metadata: Metadata = {
  title: "Adicionar Novo Bot - Union Lab",
  description: "Cadastre seu bot no Union Bot List. Ele será submetido à equipe de análise antes de aparecer na página principal.",
  openGraph: {
    title: "Adicionar Novo Bot - Union Lab",
    description: "Cadastre seu bot no Union Bot List. Ele será submetido à equipe de análise antes de aparecer na página principal.",
  },
};

export default function AddBotRoute() {
  return <AddBotClient />;
}
