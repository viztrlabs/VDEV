'use strict';

/**
 * Knowledge Base Ingestion Script
 * Crawls the site and populates the knowledge store.
 * Run with: node scripts/ingest-knowledge.js
 */

const fs = require('fs');
const path = require('path');

// Pages to ingest (add your actual routes)
const ROUTES = [
  { url: '/', title: 'Home - VizTR Architectural Visualization', source: 'page' },
  { url: '/about', title: 'About VizTR', source: 'page' },
  { url: '/services', title: 'Services', source: 'service' },
  { url: '/projects', title: 'Projects Portfolio', source: 'project' },
  { url: '/xr-world', title: 'XR World - WebXR Experiences', source: 'page' },
  { url: '/virtual-tour', title: 'Virtual Tours', source: 'page' },
  { url: '/contact', title: 'Contact Us', source: 'page' },
  { url: '/blog', title: 'Blog', source: 'blog' },
];

// Simulated content (in production, use a real crawler or fetch from CMS)
const CONTENT_MAP: Record<string, string> = {
  '/': `VizTR is a premier architectural visualization studio specializing in CGI renders, WebXR/WebAR experiences, 360° virtual tours, and AI-generated marketing for architecture firms. We produce 8K ultra-photorealistic architectural CGI, WebXR spatial browser experiences, cinematic 4K architectural films, and VR/AR worlds. Our stack includes PlayCanvas WebXR, Marzipano 360 tours, Gaussian Splats, and custom 3D pipelines.`,
  '/about': `Founded in 2020, VizTR has delivered 500+ projects for architecture firms globally. Our team combines architectural expertise with cutting-edge 3D technology. We believe visualization should be accessible, interactive, and measurable.`,
  '/services': `Our services: 1) 8K Ultra-Photorealistic Architectural CGI - $2,800/view, 3-5 days. Deliverables: 8K TIFF masters, 4K web packages, alpha mask passes, clay render signoffs. 2) WebXR Spatial & AR Browser Experiences - $4,200/model, 5-7 days. Zero-install interactive 3D with Draco compression, Vision Pro spatial audio, Instant AR. 3) Cinematic 4K Architectural Films - $8,500/minute, 2-4 weeks. ProRes 422 HQ, custom sound design, social media cutdowns. 4) VR/AR Worlds - Custom pricing. Full spatial environments.`,
  '/projects': `Featured projects: Luxury residential towers, cultural museums, commercial complexes, interior design showcases. Each project includes interactive 3D viewers, virtual tours, and marketing packages.`,
  '/xr-world': `XR World is our WebXR platform for immersive architectural experiences. Supports PlayCanvas WebXR, Apple Vision Pro, Meta Quest, and browser-based AR. Features: real-time collaboration, spatial annotations, measurement tools, and client presentation mode.`,
  '/virtual-tour': `360° Virtual Tours powered by Marzipano. Features: hotspot navigation, embedded media (images, videos, PDFs), floorplan integration, VR mode, multi-language support, analytics tracking. Perfect for real estate, hospitality, and cultural venues.`,
  '/contact': `Contact VizTR: Email: hello@viztr.io, Phone: +1 (555) 123-4567. Office: San Francisco, CA. We respond within 4 business hours. Book a consultation at /book-consultation.`,
  '/blog': `Latest insights: "The Future of Architectural Visualization in 2024", "WebXR vs Native Apps for Architecture", "AI-Generated Marketing Assets for Architects", "Gaussian Splats for Real Estate".`,
};

function chunkContent(content: string, maxChunkSize = 2000): string[] {
  const sentences = content.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkSize && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

function generateId(): string {
  return `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function main() {
  console.log('🔄 Starting knowledge base ingestion...\n');

  const allChunks = [];

  for (const route of ROUTES) {
    const content = CONTENT_MAP[route.url];
    if (!content) {
      console.warn(`⚠️  No content for ${route.url}`);
      continue;
    }

    const chunks = chunkContent(content);
    for (let i = 0; i < chunks.length; i++) {
      allChunks.push({
        id: generateId(),
        source: route.source,
        sourceId: route.url,
        title: `${route.title} (part ${i + 1}/${chunks.length})`,
        url: `https://viztr.io${route.url}`,
        content: chunks[i],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ ${route.url} → ${chunks.length} chunks`);
  }

  // Write to a JSON file that can be imported
  const outputPath = path.join(__dirname, '../lib/knowledge-seed.json');
  fs.writeFileSync(outputPath, JSON.stringify(allChunks, null, 2));
  console.log(`\n📦 Written ${allChunks.length} chunks to ${outputPath}`);
  console.log('\nTo import: Copy to knowledge-store.ts DEFAULT_CHUNKS or load at runtime.');
}

main();