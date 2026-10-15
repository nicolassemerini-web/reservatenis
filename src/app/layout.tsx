import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reservas Pista de Tenis",
  description: "Sistema de reservas públicas para la pista de tenis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
