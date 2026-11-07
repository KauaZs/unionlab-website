import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-outfit",
  display: "swap",
});

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
    <html lang="pt-BR" className={`dark ${jakarta.variable} ${outfit.variable}`}>
      <body className="min-h-screen text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
