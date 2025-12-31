import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Culture - Dashboard",
  description: "Comunidad exclusiva de desarrollo personal y crecimiento",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
