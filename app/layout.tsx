import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dopamind — Break Free, Rewire Your Brain',
  description: 'Premium habit recovery app using brainwave entrainment, HRV breathwork, and AI coaching to help you break free from addictive patterns.',
  icons: { icon: '/favicon.ico' },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0A0E1A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0E1A] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
