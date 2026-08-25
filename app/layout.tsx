import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Album NFC",
  description: "Tus viajes, en una pegatina.",
};

export const viewport: Viewport = {
  themeColor: "#F5F0EA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-arena text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
