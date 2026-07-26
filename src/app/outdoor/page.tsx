import { Metadata } from "next";
import OutdoorClient from "./OutdoorClient";

export const metadata: Metadata = {
  title: "Destaque no Outdoor - Union Lab",
  description: "Alugue o espaço de outdoor no Union Lab para destacar seu bot ou servidor com banners chamativos na home page.",
  openGraph: {
    title: "Destaque no Outdoor - Union Lab",
    description: "Alugue o espaço de outdoor no Union Lab para destacar seu bot ou servidor com banners chamativos na home page.",
  },
};

export default function OutdoorRoute() {
  return <OutdoorClient />;
}
