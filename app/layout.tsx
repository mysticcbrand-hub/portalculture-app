import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/AppleNotification";

export const metadata: Metadata = {
  title: "Portal Culture - Dashboard",
  description: "Comunidad exclusiva de desarrollo personal y crecimiento",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-black">
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
