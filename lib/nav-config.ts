/**
 * VizTR Centralized Navigation Configuration
 * 
 * Single source of truth for all navigation across the platform.
 * Aligned with the VizTR architecture blueprint.
 */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: string;
  external?: boolean;
  badge?: string;
  children?: NavItem[];
}

export const primaryNav: NavItem[] = [
  {
    id: 'studio',
    label: 'Studio',
    href: '/studio',
    children: [
      {
        id: 'studio-exterior',
        label: 'Exterior Rendering',
        href: '/studio/exterior',
        description: 'Photorealistic exterior visualizations',
      },
      {
        id: 'studio-interior',
        label: 'Interior Rendering',
        href: '/studio/interior',
        description: 'Photorealistic interior visualizations',
      },
      {
        id: 'studio-walkthrough',
        label: 'Animation Walkthrough',
        href: '/studio/walkthrough',
        description: 'Cinematic architectural walkthroughs',
      },
    ],
  },
  {
    id: 'xr-world',
    label: 'XR World',
    href: '/xr-world',
    children: [
      {
        id: 'xr-webxr',
        label: 'WebXR',
        href: '/xr-world/webxr',
        description: 'Browser-based immersive 3D/XR',
      },
      {
        id: 'xr-webar',
        label: 'WebAR',
        href: '/xr-world/webar',
        description: 'View architecture in the real world',
      },
      {
        id: 'xr-vr',
        label: 'Virtual Reality',
        href: '/xr-world/virtual-reality',
        description: 'Fully immersive virtual reality',
      },
      {
        id: 'xr-virtual-tour',
        label: 'Virtual Tour',
        href: '/xr-world/virtual-tour',
        description: '360° interactive property tours',
      },
      {
        id: 'xr-vizsplat',
        label: 'VizSplat',
        href: '/xr-world/vizsplat',
        description: 'Photorealistic 3D Gaussian Splat',
        badge: 'NEW',
      },
      {
        id: 'xr-pixel-streaming',
        label: 'Pixel Streaming',
        href: '/xr-world/pixel-streaming',
        description: 'High-end Unreal experiences',
      },
    ],
  },
  {
    id: 'creator',
    label: 'Creator',
    href: '/creator',
    children: [
      {
        id: 'creator-3d-editor',
        label: '3D Editor',
        href: '/creator/3d-editor',
        description: 'Edit GLB, GLTF, FBX, OBJ, USDZ',
      },
      {
        id: 'creator-supersplat',
        label: 'SuperSplat Editor',
        href: '/creator/supersplat',
        description: 'Specialized Gaussian Splat editor',
      },
      {
        id: 'creator-assets',
        label: 'Asset Manager',
        href: '/creator/assets',
        description: 'Manage your 3D assets',
      },
      {
        id: 'creator-publish',
        label: 'Publish',
        href: '/creator/publish',
        description: 'Publish to Web, AR, VR',
      },
    ],
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/portfolio',
  },
  {
    id: 'solutions',
    label: 'Solutions',
    href: '/solutions',
    children: [
      {
        id: 'solutions-architects',
        label: 'Architects',
        href: '/solutions/architects',
      },
      {
        id: 'solutions-real-estate',
        label: 'Real Estate',
        href: '/solutions/real-estate',
      },
      {
        id: 'solutions-developers',
        label: 'Developers',
        href: '/solutions/developers',
      },
      {
        id: 'solutions-interior',
        label: 'Interior Designers',
        href: '/solutions/interior-designers',
      },
      {
        id: 'solutions-agencies',
        label: 'Agencies',
        href: '/solutions/agencies',
      },
    ],
  },
  {
    id: 'pricing',
    label: 'Pricing',
    href: '/pricing',
  },
];

export const userNav: NavItem[] = [
  {
    id: 'login',
    label: 'Login',
    href: '/app/login',
  },
  {
    id: 'signup',
    label: 'Start a Project',
    href: '/app/register',
  },
];

export const brandHierarchy = {
  master: 'VizTR',
  tiers: [
    {
      name: 'VizTR Studio',
      description: 'Architectural Visualization',
      href: '/studio',
    },
    {
      name: 'VizTR XR World',
      description: 'Immersive experiences',
      href: '/xr-world',
    },
    {
      name: 'VizTR Creator',
      description: '3D creation and publishing',
      href: '/creator',
    },
    {
      name: 'VizSplat',
      description: 'Gaussian Splat technology',
      href: '/vizsplat',
    },
  ],
};
