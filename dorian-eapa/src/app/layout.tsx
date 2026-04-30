import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dorian EAPA",
  description: "Application clinique APA intelligente"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
