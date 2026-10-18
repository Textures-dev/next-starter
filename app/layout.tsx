import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Textures starter",
  description: "A Next.js starter with a hover texture in the hero, from textures.dev.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
