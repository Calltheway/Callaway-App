import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'Oracle — Your Second Brain',
  description: 'Oracle ingests every dimension of your life and surfaces non-obvious insights about patterns, risks, and opportunities.',
  icons:       { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-oracle-base text-oracle-text antialiased">{children}</body>
    </html>
  );
}
