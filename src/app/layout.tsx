import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { MainLayout } from "@/components/main-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeatherFind",
  description: "Identify and explore bird species with the help of AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
