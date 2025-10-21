import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luxor Auto Sale - Quality Used Cars',
  description: 'Your trusted, stress-free car buying experience starts here.',
  keywords: 'used cars, auto sale, car dealership, quality vehicles',
  authors: [{ name: 'Luxor Auto Sale' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.luxorautosale.com',
    siteName: 'Luxor Auto Sale',
    title: 'Luxor Auto Sale - Quality Used Cars',
    description: 'Your trusted, stress-free car buying experience starts here.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

