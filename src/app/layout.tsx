import type { Metadata, Viewport } from 'next';
import '@fontsource/plus-jakarta-sans/latin-ext-400.css';
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-ext-500.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-ext-600.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-ext-700.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import './globals.css';
export const metadata: Metadata = { title: 'Dom Opowieści — przywróć historiom światło', description: 'Wejdź do przytulnego domu i odkryj trzy opowieści polskiego malarstwa. Mała podróż przez sztukę, uważność i wspólnotę.' };
export const viewport: Viewport = { themeColor: '#101522' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}
