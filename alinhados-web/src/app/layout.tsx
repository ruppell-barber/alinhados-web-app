import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

/*
 * Fonte oficial do design: Neue Montreal (Pangram Pangram, requer licença comercial).
 * Interinamente usamos Inter (alternativa mais próxima). Quando a licença for
 * comprada, trocar por next/font/local — ver docs/DECISOES.md (D5).
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'Alinhados',
    template: '%s · Alinhados',
  },
  description:
    'Conexões que geram alinhamento. O Alinhados conecta barbeiros e barbearias que compartilham dos mesmos valores e objetivos.',
};

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
