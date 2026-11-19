/**
 * Static Content for Telegram Bot
 * Sourced from existing VizTR website data
 */

declare const process: {
  env: Record<string, string | undefined>;
};

import { portfolioProjects, PortfolioProject } from '../../data/portfolio';

/** About VizTR - Brand Description */
export const ABOUT_TEXT = `VizTR is an Architectural Visualization and Immersive Technology studio transforming ideas into digital experiences.

Our ecosystem combines architectural visualization, 3D design, rendering, animation, WebXR, WebAR, Virtual Reality, Virtual Tours, Gaussian Splatting and Pixel Streaming.

VizTR aims to bridge visual design, technology and real-world experiences.

Tagline: Visualize ✦ Experience ✦ Transform.

Website: https://viztr.in`;

/** Service Categories */
export interface Service {
  id: string;
  name: string;
  description: string;
  category: 'Studio' | 'XR World';
  link?: string;
}

export const SERVICES_DATA: Service[] = [
  // Studio - Commercial Visualization Production
  {
    id: 'interior_renders',
    name: 'Interior Still Renders',
    description: 'Photorealistic interior visualizations with physically-based materials, accurate lighting, and composition for marketing and design review.',
    category: 'Studio',
    link: 'https://viztr.in/services#interior',
  },
  {
    id: 'exterior_renders',
    name: 'Exterior Still Renders',
    description: 'High-fidelity exterior architectural renders showcasing facade design, landscaping, and environmental context.',
    category: 'Studio',
    link: 'https://viztr.in/services#exterior',
  },
  {
    id: 'animation_walkthrough',
    name: 'Animation / Walkthrough',
    description: 'Cinematic architectural animations and flythroughs with choreographed camera paths, atmospheric effects, and storytelling.',
    category: 'Studio',
    link: 'https://viztr.in/services#animation',
  },
  // XR World - Commercial Immersive Experience Delivery
  {
    id: 'webxr',
    name: 'WebXR',
    description: 'Zero-install interactive 3D experiences running natively in browsers across desktop, mobile, and headsets.',
    category: 'XR World',
    link: 'https://viztr.in/xr-world/webxr',
  },
  {
    id: 'webar',
    name: 'WebAR',
    description: 'Augmented reality experiences accessible instantly via QR codes — no app download required.',
    category: 'XR World',
    link: 'https://viztr.in/xr-world/webar',
  },
  {
    id: 'virtual_reality',
    name: 'Virtual Reality',
    description: 'Immersive VR applications for design review, client presentations, and virtual showrooms.',
    category: 'XR World',
    link: 'https://viztr.in/xr-world/virtual-reality',
  },
  {
    id: 'virtual_tours',
    name: 'Virtual Tours',
    description: 'Multi-node 360° virtual tours with hotspots, floorplan navigation, and interactive annotations.',
    category: 'XR World',
    link: 'https://viztr.in/xr-world/virtual-tour',
  },
  {
    id: 'gaussian_splatting',
    name: 'Gaussian Splatting',
    description: 'Real-time radiance field rendering for photorealistic 3D capture and streaming.',
    category: 'XR World',
    link: 'https://viztr.in/xr-world/vizsplat',
  },
  {
    id: 'pixel_streaming',
    name: 'Pixel Streaming',
    description: 'Cloud-rendered high-fidelity 3D experiences streamed to any device via Unreal Engine Pixel Streaming.',
    category: 'XR World',
    link: 'https://viztr.in/xr-world/pixel-streaming',
  },
];

/** Portfolio Categories from website data */
export interface PortfolioCategory {
  id: string;
  name: string;
  count: number;
  description: string;
}

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  {
    id: 'exterior',
    name: 'Exterior Visualization',
    count: portfolioProjects.filter((p: PortfolioProject) => p.category === 'exterior').length,
    description: 'Architectural exterior renders and environmental visualization',
  },
  {
    id: 'interior',
    name: 'Interior Visualization',
    count: portfolioProjects.filter((p: PortfolioProject) => p.category === 'interior').length,
    description: 'Photorealistic interior staging and material studies',
  },
  {
    id: 'walkthrough',
    name: 'Architectural Animation',
    count: portfolioProjects.filter((p: PortfolioProject) => p.category === 'walkthrough').length,
    description: 'Cinematic flythroughs and animated presentations',
  },
  {
    id: 'xr',
    name: 'Immersive XR Experiences',
    count: portfolioProjects.filter((p: PortfolioProject) => p.category === 'xr').length,
    description: 'WebXR, WebAR, and interactive 3D applications',
  },
  {
    id: '360',
    name: 'Virtual Tours',
    count: portfolioProjects.filter((p: PortfolioProject) => p.category === '360').length,
    description: '360° panoramic virtual tours with interactive navigation',
  },
];

/** Contact Information (verified from website) */
export interface ContactInfo {
  email: string;
  phoneUS: string;
  phoneUK: string;
  addressUS: string;
  addressUK: string;
  addressUAE: string;
  addressJP: string;
  productionHours: string;
}

export const CONTACT_INFO: ContactInfo = {
  email: 'hello@viztr.studio',
  phoneUS: '+1 (212) 555-0198',
  phoneUK: '+44 20 7946 0912',
  addressUS: '450 Lexington Ave, 32nd Floor, New York, NY 10017',
  addressUK: '22 Bishopsgate, Level 18, London EC2N 4BQ',
  addressUAE: 'DIFC Gate Precinct Building 4, Dubai, UAE',
  addressJP: 'Roppongi Hills Mori Tower 24F, Minato-ku, Tokyo',
  productionHours: '24/5 Worldwide Cloud Production Pipeline',
};

/** Community Links */
export interface CommunityLinks {
  whatsappChannel: string;
  whatsappCommunity: string;
  telegramChannel?: string; // Not configured yet
}

export const COMMUNITY_LINKS: CommunityLinks = {
  whatsappChannel: 'https://whatsapp.com/channel/0029VbE5HKOGehEROUogwP3Q',
  whatsappCommunity: 'https://chat.whatsapp.com/EAMNiC7HDLVFMXzH7oPrvd',
  // telegramChannel: undefined - not configured per spec
};

/** Privacy Policy URL */
export const PRIVACY_URL = 'https://viztr.in/privacy-policy';

/** Site URL (from env or Supabase settings) */
export async function getSiteUrl(): Promise<string> {
  // 1. Check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;

  // 2. Fall back to Supabase settings table (admin-configurable)
  try {
    const { getServerCredential } = await import('@/lib/server-credentials');
    const supabaseUrl = await getServerCredential('NEXT_PUBLIC_SITE_URL');
    if (supabaseUrl) return supabaseUrl;
  } catch {
    // Supabase not available or key not set - fall through to default
  }

  // 3. Default fallback
  return 'https://viztr.in';
}

/** Social Media Links */
export interface SocialLinks {
  instagram: string;
  threads: string;
  x: string;
  facebook: string;
  discordProfile: string;
  discordServer: string;
  linkedIn: string;
  telegramBot: string;
  youtube: string;
  youtubeCommunity: string;
}

export const SOCIAL_LINKS: SocialLinks = {
  youtube: 'https://www.youtube.com/@VizTR_Official',
  instagram: 'https://instagram.com/viztr_official',
  threads: 'https://threads.com/@viztr_official',
  x: 'https://x.com/viztr_official',
  facebook: 'https://facebook.com/profile.php?id=61581506345579',
  discordProfile: 'https://discord.com/users/1422537346380730459',
  discordServer: 'https://discord.gg/XKFwVBxSDR',
  linkedIn: 'https://linkedin.com/in/viztrofficial',
  telegramBot: 'https://t.me/viztr_bot',
  youtubeCommunity: 'https://www.youtube.com/@VizTR_Official/community',
};

/** Support Information (async to resolve site URL from env or Supabase) */
export async function getSupportInfo(): Promise<string> {
  const siteUrl = await getSiteUrl();
  return `For technical support and project inquiries:

• Email: hello@viztr.studio
• Website: ${siteUrl}/contact
• Project Enquiry: ${siteUrl}/book-consultation

For urgent production issues, contact your dedicated project manager directly.

Response time: Within 24 hours during business days.`;
}