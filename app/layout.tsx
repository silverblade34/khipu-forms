import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Khipu Forms — Constructor de formularios moderno',
  description: 'Crea formularios sin fricción, compártelos por link y recibe respuestas en tiempo real. Minimalista, rápido y bien diseñado.',
  metadataBase: new URL('https://forms.khipu.lat'),
  openGraph: {
    title: 'Khipu Forms',
    description: 'Constructor de formularios online simple, rápido y moderno.',
    url: 'https://forms.khipu.lat',
    siteName: 'Khipu Forms',
    locale: 'es_PE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
