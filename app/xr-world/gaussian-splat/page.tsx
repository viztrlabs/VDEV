'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Cpu,
  Camera,
  Zap,
  Download,
  Github,
  ArrowDown
} from 'lucide-react';
import { servicePagesData } from '@/data/pages';

export default function GaussianSplatShowcasePage() {
  const data = servicePagesData['xr-gaussian-splat'];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    // Initialize a simple Three.js Gaussian Splatting demo
    // In production, this would load actual .ply/.splat files
    const initScene = async () => {
      if (!canvasRef.current) return;

      // Dynamic import to avoid SSR issues
      const { Scene, PerspectiveCamera, WebGLRenderer } = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');

      const canvas = canvasRef.current;
      const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = 1; // ACESFilmicToneMapping
      renderer.toneMappingExposure = 1;

      const scene = new Scene();
      const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(0, 1.6, 3);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 0.5;
      controls.maxDistance = 20;
      controls.target.set(0, 1, 0);

      // Add ambient light
      const ambientLight = new (await import('three')).AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Add directional light
      const dirLight = new (await import('three')).DirectionalLight(0xffffff, 1);
      dirLight.position.set(5, 10, 7);
      scene.add(dirLight);

      // Add ground plane
      const groundGeometry = new (await import('three')).PlaneGeometry(20, 20);
      const groundMaterial = new (await import('three')).MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9,
        metalness: 0
      });
      const ground = new (await import('three')).Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.5;
      scene.add(ground);

      // Placeholder for Gaussian Splat - in production this would load .ply/.splat files
      // For now, create a visual representation
      const particlesGeometry = new (await import('three')).BufferGeometry();
      const particleCount = 50000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        // Create a building-like structure with Gaussian distribution
        const radius = 2 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const height = Math.random() * 5;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

        // Color based on height (architectural materials)
        const h = height / 5;
        colors[i * 3] = 0.2 + h * 0.3;     // R - warm tones
        colors[i * 3 + 1] = 0.15 + h * 0.2; // G
        colors[i * 3 + 2] = 0.1 + h * 0.15; // B

        sizes[i] = 0.02 + Math.random() * 0.03;
      }

      particlesGeometry.setAttribute('position', new (await import('three')).BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('color', new (await import('three')).BufferAttribute(colors, 3));
      particlesGeometry.setAttribute('size', new (await import('three')).BufferAttribute(sizes, 1));

      const particlesMaterial = new (await import('three')).PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
        depthWrite: false
      });

      const particles = new (await import('three')).Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      // Animation loop
      let animationId: number;
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        particles.rotation.y += 0.0005;
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      setIsLoaded(true);

      const handleResize = () => {
        if (!canvasRef.current) return;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
      };
    };

    initScene().catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/xr-world" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5 text-zinc-400 hover:text-white transition-colors" />
            <span className="text-sm font-semibold text-zinc-300 hidden sm:block">Back to XR World</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/antimatter15/splat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono text-zinc-300 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View on GitHub</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ touchAction: 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="px-3.5 py-1 rounded-full bg-rose-600/30 border border-rose-500/40 text-rose-400 text-xs font-bold uppercase tracking-widest inline-block">
                {data.badge}
              </span>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-display leading-tight">
                {data.title}
              </h1>
              <p className="text-lg sm:text-xl text-zinc-300 max-w-xl leading-relaxed">
                {data.tagline}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Gaussian Splat Demo</span>
                </button>
                <Link
                  href="/xr-world/super-splat"
                  className="px-6 py-3.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-sm border border-rose-600/50 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open SuperSplat Editor</span>
                </Link>
                <Link
                  href="/xr-world"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to XR Hub</span>
                </Link>
              </div>

              {/* Tech Stack Badges */}
              <div className="flex flex-wrap gap-2 pt-4">
                {data.capabilities?.map((cap, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700 text-xs font-mono text-zinc-400">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div className="relative">
              <div className="aspect-video rounded-3xl bg-zinc-900/50 border border-zinc-800 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                  {!isLoaded && (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 border-4 border-rose-500/50 border-t-rose-500 rounded-full animate-spin mx-auto" />
                      <p className="text-sm font-mono">Initializing WebGL Renderer...</p>
                      <p className="text-xs text-zinc-600">Loading Gaussian Splat point cloud</p>
                    </div>
                  )}
                  {isLoaded && (
                    <div className="text-center space-y-2 text-zinc-600">
                      <p className="text-xs font-mono text-rose-400">● 60 FPS • WebGL2 • WASM Accelerated</p>
                      <p className="text-xs">Drag to orbit • Scroll to zoom • Right-click to pan</p>
                    </div>
                  )}
                </div>
                {isLoaded && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" title="Fullscreen">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors" title="Download PLY">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Overlay */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-rose-400">60</div>
                  <div className="text-xs text-zinc-500 mt-1">FPS Target</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-emerald-400">50K</div>
                  <div className="text-xs text-zinc-500 mt-1">Gaussians</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-cyan-400">{'<2s'}</div>
                  <div className="text-xs text-zinc-500 mt-1">Load Time</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-amber-400">WebGPU</div>
                  <div className="text-xs text-zinc-500 mt-1">Accelerated</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-zinc-500" />
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Technical Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mt-2">
            How Gaussian Splatting Works
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            Unlike NeRFs that use neural networks, 3D Gaussian Splatting represents scenes as millions of overlapping 3D Gaussians —
            enabling real-time rendering at 100+ FPS with photorealistic quality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Camera,
              title: 'Sparse Input Photos',
              desc: 'Structure-from-Motion on 50-200 photos creates initial point cloud with camera poses.',
              color: 'text-cyan-400'
            },
            {
              icon: Zap,
              title: 'Gaussian Optimization',
              desc: 'Differentiable rasterization optimizes position, covariance, color, and opacity per Gaussian.',
              color: 'text-rose-400'
            },
            {
              icon: Cpu,
              title: 'Real-Time Rasterization',
              desc: 'Tile-based sorting + alpha blending renders millions of Gaussians at 60+ FPS on GPU.',
              color: 'text-emerald-400'
            }
          ].map((step, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4 transition-all hover:border-rose-500/30">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 w-fit">
                <step.icon className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold font-display">{step.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Advantages */}
      <section className="py-20 px-6 bg-zinc-900/30 border-y border-zinc-800">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Why Gaussian Splatting?</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mt-2">
              10x Faster Than NeRF, Photorealistic Quality
            </h2>
            <p className="text-sm text-zinc-400 mt-3">
              The architectural visualization breakthrough that makes real-time radiance fields practical for web deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'Real-Time 60+ FPS', desc: 'Tile-based differentiable rasterization enables interactive frame rates on mobile GPUs — no neural network inference needed.', icon: Zap, metric: '100+ FPS' },
              { title: 'Explicit Scene Representation', desc: 'Each Gaussian has interpretable parameters (position, rotation, scale, color, opacity) — editable and compressible.', icon: Sparkles, metric: 'Explicit' },
              { title: 'Instant Training', desc: 'Optimization converges in 1-4 minutes on a single GPU vs hours for NeRF — iterate rapidly on architectural captures.', icon: Cpu, metric: '~2 min' },
              { title: 'Web-Native Deployment', desc: 'WASM/WebGPU implementations run in-browser — zero-install architectural walkthroughs from photo sets.', icon: ArrowUpRight, metric: 'Zero-Install' },
              { title: 'Massive Compression', desc: 'Quantized attributes + entropy coding achieve 10-50x smaller than point clouds with equal visual fidelity.', icon: Download, metric: '10-50x' },
              { title: 'Architecture-Grade Quality', desc: 'Handles specular reflections, thin geometry, and fine architectural details better than mesh-based methods.', icon: Camera, metric: 'Photoreal' }
            ].map((adv, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0">
                  <adv.icon className="w-5 h-5 text-rose-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{adv.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-mono font-bold">{adv.metric}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{adv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases for Architecture */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Architecture Applications</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mt-2">
            Perfect for Architectural Visualization
          </h2>
          <p className="text-sm text-zinc-400 mt-3">
            Gaussian Splatting excels at capturing the material richness and lighting complexity of built environments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'Heritage Building Documentation',
            'Construction Progress Capture',
            'Interior Material Showcase',
            'Facade & Cladding Studies',
            'Lighting Analysis Visualization',
            'Client Presentation Walkthroughs'
          ].map((useCase, i) => (
            <div key={i} className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 transition-all hover:border-rose-500/30 hover:bg-zinc-900">
              <CheckCircle2 className="w-5 h-5 text-rose-400 mb-3" />
              <h3 className="text-lg font-bold font-display text-white group-hover:text-rose-300 transition-colors">{useCase}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Pipeline Integration */}
      <section className="py-20 px-6 bg-zinc-900/30 border-y border-zinc-800">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">VizTR Pipeline Integration</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-display mt-2">
              End-to-End Gaussian Splat Workflow
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Photo Acquisition', desc: 'Drone + ground capture: 100-200 overlapping photos with 80%+ overlap. Automated flight plans for consistent coverage.', duration: '30-60 min' },
              { step: 2, title: 'SfM & Dense Reconstruction', desc: 'COLMAP/RealityCapture computes camera poses and sparse point cloud. Initial Gaussian positions seeded from dense points.', duration: '5-10 min' },
              { step: 3, title: 'Gaussian Optimization', desc: 'Differentiable rasterization (CUDA/Metal) optimizes 100K-1M+ Gaussians. Position, covariance, SH coefficients, opacity.', duration: '2-4 min' },
              { step: 4, title: 'Compression & Export', desc: 'Quantization (16-bit positions, 8-bit colors/opacity), entropy coding. Export .ply, .splat, or compressed .ksplat for web.', duration: '1-2 min' },
              { step: 5, title: 'Web Deployment', desc: 'WebGPU/WASM viewer loads compressed splats. Progressive streaming for large scenes. Embed in VizTR client portal with analytics.', duration: 'Instant' }
            ].map((p) => (
              <div key={p.step} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-2xl font-bold font-mono text-rose-400">
                  {p.step}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold font-display">{p.title}</h3>
                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{p.duration}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto text-center">
        <div className="bg-gradient-to-r from-rose-950/50 to-zinc-900 border border-rose-500/30 rounded-3xl p-12 md:p-16 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white">
            Ready to Capture Your Project in Gaussian Splats?
          </h2>
          <p className="text-zinc-300 max-w-2xl mx-auto">
            Transform photo sets into interactive 3D radiance fields. Deploy to web, VR, or client portals with zero-install access.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Gaussian Splat Project</span>
            </Link>
            <Link
              href="/xr-world"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explore Other XR Services</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800 bg-zinc-950/50">
        <div className="max-w-[1400px] mx-auto text-center text-zinc-500 text-sm">
          <p>VizTR XR World — Gaussian Splatting 3D Capture Service</p>
          <p className="mt-1">Photorealistic real-time radiance fields for architectural visualization</p>
        </div>
      </footer>
    </div>
  );
}