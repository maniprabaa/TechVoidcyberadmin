import type { Metadata } from 'next';
import { IBM_Plex_Sans, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { AdminShell } from '@/components/AdminShell';

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const display = Source_Serif_4({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: {
    default: 'CyberIntel Admin',
    template: '%s | CyberIntel Admin',
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
