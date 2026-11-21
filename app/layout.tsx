import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import LayoutShell from '@/components/layout/LayoutShell';
import GlobalViewers from '@/components/layout/GlobalViewers';
import { MessagingAgent } from '@/components/ui/MessagingAgent';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { GoogleTagManager } from '@/components/analytics/GoogleTagManager';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo';
import ConsentModalWrapper from '@/components/analytics/ConsentModalWrapper';

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
    'Where Architecture Meets Immersive Reality. Photorealistic architectural CGI, 4K walkthrough animations, WebXR in-browser engines, and 360° virtual tours.',
  openGraph: {
    title: 'VizTR — Architecture Visualization Studio & XR World Platform',
    description:
      'Where Architecture Meets Immersive Reality. Photorealistic architectural CGI, WebXR spatial engines, and immersive browser-based experiences.',
    type: 'website',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VizTR — Architecture Visualization Studio & XR World Platform',
    description:
      'Where Architecture Meets Immersive Reality. Photorealistic architectural CGI, WebXR spatial engines, and immersive browser-based experiences.',
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
              (function(){
                if(typeof window==='undefined')return;
                var OF=window.fetch;
                window.fetch=function(){var a=arguments;if(a[1]&&a[1].headers){var h=a[1].headers;if(h instanceof Headers){var ks=[];h.forEach(function(v,k){if(/[^\\x00-\\xff]/.test(v))ks.push(k)});ks.forEach(function(k){h.delete(k)})}else if(typeof h==='object'){Object.keys(h).forEach(function(k){if(typeof h[k]==='string'&&/[^\\x00-\\xff]/.test(h[k]))delete h[k]})}}return OF.apply(this,a)};
              })();
            `,
          }}
        />
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
                  document.documentElement.style.colorScheme = mode;
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Google Tag Manager (Controlled via Super Admin per-page settings) */}
        <GoogleTagManager />
      </head>
      <body className={`${manrope.variable} ${inter.variable} min-h-screen flex flex-col antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[#00F0FF] selection:text-black`} suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider>
            <LayoutShell>{children}</LayoutShell>

            {/* Global Universal Lightboxes & Interactive Spatial Viewers */}
            <GlobalViewers />
          </ThemeProvider>
        </NextAuthProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <ConsentModalWrapper />
        <OrganizationJsonLd
          name="VizTR"
          url="https://viztr.vercel.app"
          logo="https://viztr.vercel.app/logo.png"
          description="High-density architectural rendering, real-time WebXR spatial computing, and immersive browser-based experiences."
          email="viztr.studio@gmail.com"
          phone="+91 9336561591"
          address={{
            streetAddress: 'Pitampura',
            addressLocality: 'Pitampura AU Block',
            addressRegion: 'Delhi',
            postalCode: '110092',
            addressCountry: 'India',
          }}
          socialLinks={[
            'https://instagram.com/viztr_official',
            'https://www.threads.com/@viztr_official',
            'https://x.com/viztr_official',
            'https://facebook.com/profile.php?id=61581506345579',
            'https://discord.gg/XKFwVBxSDR',
            'https://linkedin.com/in/viztrofficial',
            'https://www.youtube.com/@VizTR_Official',
          ]}
        />
        <WebSiteJsonLd
          name="VizTR Studio"
          url="https://viztr.vercel.app"
          searchUrl="https://viztr.vercel.app/search?q={search_term_string}"
        />
      </body>
    </html>
  );
}