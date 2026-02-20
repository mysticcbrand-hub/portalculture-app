import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/AppleNotification";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Portal Culture — App",
  description: "Portal Culture: acceso exclusivo a tu evolución personal",
  icons: {
    icon: [
      { url: '/este_logo.ico' },
      { url: '/este_logo.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/este_logo.ico', sizes: '32x32', type: 'image/x-icon' },
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
