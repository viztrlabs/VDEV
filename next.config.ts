import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {NextConfig} from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next.js does not mis-detect a
  // stray parent lockfile (C:\Users\Arch_Viz\package-lock.json) as the root,
  // which causes the Pages bootstrap chunk (pages/_document.js) to resolve
  // server chunks from the wrong directory -> "Cannot find module './1095.js'".
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Tree-shake barrel files for huge icon libraries.
  experimental: {
    optimizePackageImports: ['lucide-react', 'motion'],
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.mixkit.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, { dev, isServer }) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modify—file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    // Enable WebAssembly for @playcanvas/splat-transform WebP codec
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle @playcanvas/splat-transform's node: imports and WASM assets
    config.resolve.alias = {
      ...config.resolve.alias,
      'webp.wasm': path.resolve(__dirname, 'public/splat-editor/lib/webp/webp.wasm'),
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      'node:os': false,
      'node:module': false,
      'node:worker_threads': false,
      'node:fs': false,
      'node:path': false,
      'node:process': false,
      'node:util': false,
      'os': false,
      'module': false,
      'worker_threads': false,
      'fs': false,
      'path': false,
      'process': false,
      'util': false,
    };

    // Externals for node: scheme — prevents "UnhandledSchemeError" on Vercel
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : []),
      ({ request }: { request: string }, callback: (err?: Error | null, result?: string) => void) => {
        if (request.startsWith('node:')) {
          return callback(null, 'commonjs ' + request.slice(5));
        }
        callback();
      },
    ];

    // Handle WGSL shaders as raw source
    config.module.rules.push({
      test: /\.wgsl$/,
      type: 'asset/source',
    });

    return config;
  },
  async headers() {
    return [
      {
        source: '/splat-editor/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
      { source: '/terms', destination: '/terms-conditions', permanent: true },
      { source: '/admin', destination: '/admin/dashboard', permanent: true },
      { source: '/app/super-admin/:path*', destination: '/admin/dashboard', permanent: true },
    ];
  },
};

export default nextConfig;
