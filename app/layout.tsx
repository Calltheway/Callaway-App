import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'Keeper — Your AI Money Agent',
  description: 'Keeper automatically finds and recovers money you\'re losing to forgotten subscriptions, billing errors, and overpriced services.',
  icons:       { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
