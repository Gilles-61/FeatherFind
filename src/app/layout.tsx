
import type {Metadata} from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { MainLayout } from '@/components/main-layout';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'FeatherFind',
  description: 'An AI-powered app to help you identify birds.',
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
      <body className="font-body antialiased">
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
