import type { Metadata } from 'next';
import ExploreExperienceView from '@/components/explore/ExploreExperienceView';

export const metadata: Metadata = {
  title: 'Experience — VizTR XR Studio',
  description:
    'Interactive spatial visualization platform supporting WebXR, WebAR, VR Headset, 360° Virtual Tours, 3D Gaussian Splatting, and Unreal Engine 5 Pixel Streaming.',
};

export default function ExperiencePage() {
  return <ExploreExperienceView />;
}
