import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/AppleNotification";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Portal Culture — App",
  description: "Portal Culture: acceso exclusivo a tu evolución personal",
  icons: {
    icon: [
      { url: '/favicon.ico', rel: 'shortcut icon' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/este_logo.ico', sizes: '256x256', type: 'image/x-icon' },
    ],
    apple: '/logo.png',
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
        <PageTransition />
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
