import type { Metadata } from 'next';
import { Poppins, Fredoka } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const fredoka = Fredoka({
  variable: '--font-fredoka',
  subsets: ['latin'],
});
const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Friends of Raleigh Greenway Scavenger Hunt',
  description: 'A fun and engaging scavenger hunt experience in Raleigh, NC',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.variable} ${poppins.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
