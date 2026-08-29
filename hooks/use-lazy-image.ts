import { useEffect, useRef, useState, useCallback } from 'react';

// Image preloader utility
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map(preloadImage));
}

// Hook for lazy loading images with Intersection Observer
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [srcLoaded, setSrcLoaded] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.src = src;
    imgRef.current = img;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Image is in viewport, start loading
            if (img.complete) {
              setSrcLoaded(src);
              setIsLoading(false);
            } else {
              img.onload = () => {
                setSrcLoaded(src);
                setIsLoading(false);
              };
              img.onerror = () => {
                setError(new Error(`Failed to load image: ${src}`));
                setIsLoading(false);
              };
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    observerRef.current = observer;

    // We need a dummy element to observe - create a sentinel
    const sentinel = document.createElement('div');
    sentinel.style.width = '1px';
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.left = '0';
    sentinel.style.pointerEvents = 'none';
    document.body.appendChild(sentinel);
    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
      document.body.removeChild(sentinel);
      observer.disconnect();
    };
  }, [src]);

  return { srcLoaded, isLoading, error };
}

// Hook for preloading adjacent scenes
export function useScenePreloader(
  currentSceneIndex: number,
  scenes: Array<{ id: string; panoramaUrl: string; thumbnailUrl: string }>,
  preloadCount: number = 2
) {
  useEffect(() => {
    const urlsToPreload: string[] = [];

    // Preload current scene
    const currentScene = scenes[currentSceneIndex];
    if (currentScene) {
      urlsToPreload.push(currentScene.panoramaUrl);
    }

    // Preload adjacent scenes
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = (currentSceneIndex + i) % scenes.length;
      const prevIndex = (currentSceneIndex - i + scenes.length) % scenes.length;

      const nextScene = scenes[nextIndex];
      const prevScene = scenes[prevIndex];

      if (nextScene) urlsToPreload.push(nextScene.panoramaUrl);
      if (prevScene) urlsToPreload.push(prevScene.panoramaUrl);

      // Also preload thumbnails
      if (nextScene) urlsToPreload.push(nextScene.thumbnailUrl);
      if (prevScene) urlsToPreload.push(prevScene.thumbnailUrl);
    }

    // Preload all images
    const promises = urlsToPreload.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't reject on error, just continue
        img.src = url;
      });
    });

    Promise.all(promises).catch(() => {
      // Ignore preload errors
    });
  }, [currentSceneIndex, scenes, preloadCount]);
}

export function preloadTourImages(scenes: Array<{ panoramaUrl: string; thumbnailUrl: string }>) {
  const urls = scenes.flatMap((s) => [s.panoramaUrl, s.thumbnailUrl]);
  return preloadImages(urls);
}