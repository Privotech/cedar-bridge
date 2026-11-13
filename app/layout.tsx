import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Cedar Ridge — Surveyed Land Plots & Site Inspections',
  description: 'Explore surveyed land plots with transparent sizes, pricing, site photography, an interactive location map, and instant inspection booking or WhatsApp inquiry.',
  openGraph: {
    title: 'Cedar Ridge — Surveyed Land Plots & Site Inspections',
    description: 'Explore surveyed land plots with transparent sizes, pricing, site photography, an interactive location map, and instant inspection booking or WhatsApp inquiry.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cedar Ridge — Surveyed Land Plots & Site Inspections',
    description: 'Explore surveyed land plots with transparent sizes, pricing, site photography, an interactive location map, and instant inspection booking or WhatsApp inquiry.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
