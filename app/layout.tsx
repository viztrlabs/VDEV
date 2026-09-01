import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-provider';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GalleryViewer from '@/components/viewers/GalleryViewer';
import PanoramaViewer from '@/components/viewers/PanoramaViewer';
import ModelViewer from '@/components/viewers/ModelViewer';
import PixelStreamingTerminal from '@/components/viewers/PixelStreamingTerminal';
import ToastNotification from '@/components/ui/ToastNotification';
import ThemePreviewModal from '@/components/ui/ThemePreviewModal';

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
    <html lang="en" suppressHydrationWarning>
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
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#3ECF8E] selection:text-black" suppressHydrationWarning>
        <NextAuthProvider>
        <ThemeProvider>
          {/* Main Global Sticky Header */}
          <Header />

          {/* Main Application Page Content */}
          <div className="flex-1 flex flex-col">{children}</div>

          {/* Main Global Footer */}
          <Footer />

          {/* Global Universal Lightboxes & Interactive Spatial Viewers */}
          <GalleryViewer />
          <PanoramaViewer />
          <ModelViewer />
          <PixelStreamingTerminal />
          <ToastNotification />
          <ThemePreviewModal />
        </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
