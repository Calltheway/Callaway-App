import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AIChat from '@/components/AIChat';

export const metadata: Metadata = {
  title: 'LUMIS — AI-Powered Fashion for the Future',
  description: 'Shop the future of fashion with AI-powered styling, virtual try-on, and personalized recommendations powered by Claude.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'LUMIS — AI Fashion',
    description: 'The world\'s first AI-native fashion house. Powered by Claude.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
        <CartDrawer />
        <AIChat />
      </body>
    </html>
  );
}
