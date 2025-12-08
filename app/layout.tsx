import type { Metadata } from 'next';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';

export const metadata: Metadata = {
  title: 'ARCMOON.FUN - Memecoin Launcher on Arc Testnet',
  description: 'Launch your memecoin to the moon on Arc Testnet',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-moon-gradient" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

