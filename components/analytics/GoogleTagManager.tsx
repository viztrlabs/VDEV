'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { GTMPageRule } from '@/lib/super-admin-store-types';

interface GTMConfig {
  containerId: string;
  isEnabled: boolean;
  defaultRule: 'include_all' | 'exclude_all';
  pageRules: GTMPageRule[];
}

export function GoogleTagManager() {
  const pathname = usePathname();
  const configRef = useRef<GTMConfig | null>(null);
  const scriptInjectedRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function evaluateAndInject() {
      try {
        if (!configRef.current) {
          const res = await fetch('/api/gtm/config');
          const data = await res.json();
          if (data.success && data.data) {
            configRef.current = data.data;
          }
        }

        const config = configRef.current;
        if (!config || !config.isEnabled || !config.containerId) {
          return;
        }

        // Match current route against pageRules
        const rules = config.pageRules || [];
        const currentPath = pathname || '/';

        let isPageEnabled = config.defaultRule === 'include_all';

        // Check if there is an exact or prefix match
        const matchingRule = rules.find((r) => {
          if (r.path === currentPath) return true;
          if (r.path !== '/' && currentPath.startsWith(r.path)) return true;
          return false;
        });

        if (matchingRule) {
          isPageEnabled = matchingRule.enabled;
        }

        if (!isPageEnabled) {
          // If GTM is disabled for this page, push a suppression event to dataLayer if active
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: 'gtm_suppressed_for_route',
              path: currentPath,
            });
          }
          return;
        }

        // If enabled and not yet injected into head, inject immediately
        if (!scriptInjectedRef.current && isMounted) {
          // 1. Ensure window.dataLayer & gtag are initialized immediately after head
          window.dataLayer = window.dataLayer || [];
          function gtag(...args: any[]) {
            window.dataLayer.push(args);
          }
          gtag('js', new Date());

          // 2. Inject Google Tag Manager script
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtm.js?id=${config.containerId}`;
          script.id = 'gtm-injected-script';
          document.head.appendChild(script);

          scriptInjectedRef.current = true;
        } else if (scriptInjectedRef.current) {
          // On client page route changes, push pageview to GTM dataLayer
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({
              event: 'pageview',
              page: currentPath,
            });
          }
        }
      } catch (err) {
        console.error('Failed to initialize Google Tag Manager:', err);
      }
    }

    evaluateAndInject();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return null;
}
