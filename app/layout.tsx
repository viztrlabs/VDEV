import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import LayoutShell from '@/components/layout/LayoutShell';
import GlobalViewers from '@/components/layout/GlobalViewers';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'VizTR — Architecture Visualization Studio & XR World Platform',
  description:
    'Where Architecture Meets Immersive Reality. Photorealistic architectural CGI, 4K walkthrough animations, WebXR in-browser engines, 360° virtual tours, and cloud Pixel Streaming.',
  openGraph: {
    title: 'VizTR — Architecture Visualization Studio & XR World Platform',
    description:
      'Where Architecture Meets Immersive Reality. Photorealistic architectural CGI, WebXR spatial engines, and cloud Pixel Streaming.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VizTR — Architecture Visualization Studio & XR World Platform',
    description:
      'Where Architecture Meets Immersive Reality. Photorealistic architectural CGI, WebXR spatial engines, and cloud Pixel Streaming.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('viztr-theme') || 'dark';
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var mode = saved === 'system' ? (systemDark ? 'dark' : 'light') : (saved === 'light' ? 'light' : 'dark');
                  var themeId = saved === 'system' ? (systemDark ? 'dark' : 'light') : saved;
                  document.documentElement.classList.add(mode);
                  document.documentElement.classList.add('theme-' + themeId);
                  if (saved === 'system') document.documentElement.classList.add('theme-system');
                  document.documentElement.setAttribute('data-theme', themeId);
                  document.documentElement.setAttribute('data-theme-setting', saved);
                  document.documentElement.setAttribute('data-theme-mode', mode);
                  document.documentElement.style.colorScheme = mode;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} min-h-screen flex flex-col antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[#00F0FF] selection:text-black`} suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider>
            <LayoutShell>{children}</LayoutShell>

            {/* Global Universal Lightboxes & Interactive Spatial Viewers */}
            <GlobalViewers />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
