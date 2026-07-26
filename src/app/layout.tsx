import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Union Lab - Bot List & Community Hub",
  description: "Navegue pelas criações inovadoras de nossa comunidade de desenvolvedores, apoie seus favoritos e ganhe unicoins avaliando o bot!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#050507] text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
