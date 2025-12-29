import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Culture - App",
  description: "Accede a la comunidad exclusiva de desarrollo personal",
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
