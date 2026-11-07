import type { Metadata } from "next";
// Fonts are self-hosted from npm so the build never has to download them from Google
// (next/font/google failed in the deploy environment with "module not found").
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/outfit";
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
      <body className="min-h-screen text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
