import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VizTR Database...');

  // 1. Seed Users (RBAC)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@viztr.com' },
    update: {},
    create: {
      email: 'admin@viztr.com',
      name: 'VizTR Chief Technology Officer',
      role: 'SUPER_ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@viztr.com' },
    update: {},
    create: {
      email: 'manager@viztr.com',
      name: 'Alexander Cross',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: 'user@viztr.com' },
    update: {},
    create: {
      email: 'user@viztr.com',
      name: 'Elena Rostova',
      role: 'CLIENT',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
  });

  // 2. Seed Services
  const services = [
    {
      name: 'Exterior CGI Visualization',
      slug: 'exterior-cgi',
      category: 'STUDIO' as const,
      description: '8K architectural stills with physical sun simulation, environmental scattering, and material reflections.',
      order: 1,
    },
    {
      name: 'Interior CGI & Lighting',
      slug: 'interior-cgi',
      category: 'STUDIO' as const,
      description: 'Luxury interior staging, bespoke millwork modeling, and high-fidelity lighting calculation.',
      order: 2,
    },
    {
      name: 'Cinematic Walkthrough Animations',
      slug: 'walkthrough-animations',
      category: 'STUDIO' as const,
      description: '4K 60FPS architectural films featuring drone camera kinematics, dynamic seasons, and color grading.',
      order: 3,
    },
    {
      name: 'WebXR Interactive 3D',
      slug: 'webxr-interactive',
      category: 'XR_WORLD' as const,
      description: 'Zero-install real-time WebGL/WebXR spatial models with material switchers and sun position control.',
      order: 4,
    },
    {
      name: 'Unreal Engine Pixel Streaming',
      slug: 'pixel-streaming',
      category: 'XR_WORLD' as const,
      description: 'NVIDIA GPU-streamed real-time raytraced digital twins to any browser or mobile device.',
      order: 5,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    });
  }

  // 3. Seed Projects
  const project1 = await prisma.project.upsert({
    where: { slug: 'apex-tower' },
    update: {},
    create: {
      id: 'VIZTR-882',
      name: 'The Apex Tower',
      slug: 'apex-tower',
      status: 'CLIENT_REVIEW',
      progress: 75,
      serviceCategory: 'Commercial High-Rise & WebXR',
      clientName: 'Foster & Partners',
      clientEmail: 'elena.rostova@fosterpartners.com',
      description: 'Parametric diagrid high-rise with active solar tracking curtain wall.',
    },
  });

  const project2 = await prisma.project.upsert({
    where: { slug: 'solarium-sky-penthouse' },
    update: {},
    create: {
      id: 'VIZTR-904',
      name: 'Solarium Sky Penthouse',
      slug: 'solarium-sky-penthouse',
      status: 'IN_PRODUCTION',
      progress: 50,
      serviceCategory: 'Luxury Residential Interior',
      clientName: 'Zaha Hadid Architects',
      clientEmail: 'markus@zaha-hadid.com',
      description: 'Panoramic glass penthouse featuring double-height ceiling voids.',
    },
  });

  const project3 = await prisma.project.upsert({
    where: { slug: 'nordic-monolith-residence' },
    update: {},
    create: {
      id: 'VIZTR-771',
      name: 'Nordic Monolith Residence',
      slug: 'nordic-monolith-residence',
      status: 'COMPLETED',
      progress: 100,
      serviceCategory: 'Residential Architecture',
      clientName: 'Snøhetta Studio',
      clientEmail: 'soren@snohetta.com',
      description: 'Cast-in-place concrete villa embedded into a Norwegian fjord ridge.',
    },
  });

  // 4. Seed Testimonials
  const testimonials = [
    {
      author: 'Lord Norman Foster',
      role: 'Founding Partner',
      firm: 'Foster + Partners',
      quote: 'VizTR sets a world standard in architectural visual computing. Their WebXR models allowed our international committee to approve structural cantilevers seamlessly.',
      rating: 5,
    },
    {
      author: 'Sarah Whiting, FAIA',
      role: 'Dean & Principal',
      firm: 'Harvard GSD / WW Architects',
      quote: 'The level of photometric accuracy in VizTR renders is staggering. Daylight analysis matches our physical sensor predictions within 2% margin of error.',
      rating: 5,
    },
    {
      author: 'Bjarke Ingels',
      role: 'Founder & Creative Director',
      firm: 'BIG (Bjarke Ingels Group)',
      quote: 'Pixel Streaming from VizTR changes everything for global competitions. Zero compression artifacts, instant responsiveness, and pure architectural presence.',
      rating: 5,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: t,
    });
  }

  // 5. Seed Site Settings
  await prisma.siteSettings.upsert({
    where: { key: 'general' },
    update: {},
    create: {
      key: 'general',
      value: {
        siteName: 'VizTR Architectural Labs',
        contactEmail: 'contact@viztr.io',
        supportPhone: '+1 (800) 849-8799',
        currency: 'USD',
        theme: 'dark',
      },
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
