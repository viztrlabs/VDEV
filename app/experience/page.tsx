import type { Metadata } from 'next';
import ExploreExperienceView from '@/components/explore/ExploreExperienceView';

export const metadata: Metadata = {
  title: 'Experience — VizTR XR Studio',
  description:
    'Interactive spatial visualization platform supporting WebXR, WebAR, VR Headset, 360° Virtual Tours, and 3D Gaussian Splatting.',
};

export default function ExperiencePage() {
  return <ExploreExperienceView />;
}
