import { ABOUT_TEXT, SERVICES_DATA, PORTFOLIO_CATEGORIES, CONTACT_INFO, COMMUNITY_LINKS, PRIVACY_URL, getSiteUrl, SUPPORT_INFO } from '@/lib/telegram/content';

describe('Telegram Content', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('about text contains brand tagline', () => {
    expect(ABOUT_TEXT).toContain('Visualize ✦ Experience ✦ Transform');
  });

  test('about text contains website URL', () => {
    expect(ABOUT_TEXT).toContain('https://viztr.in');
  });

  test('about text mentions key services', () => {
    expect(ABOUT_TEXT).toContain('WebXR');
    expect(ABOUT_TEXT).toContain('Virtual Reality');
    expect(ABOUT_TEXT).toContain('Gaussian Splatting');
  });

  test('services has Studio and XR World categories', () => {
    const categories = SERVICES_DATA.map(s => s.category);
    expect(categories).toContain('Studio');
    expect(categories).toContain('XR World');
  });

  test('services has exactly 9 services (3 Studio + 6 XR World)', () => {
    const studio = SERVICES_DATA.filter(s => s.category === 'Studio');
    const xrWorld = SERVICES_DATA.filter(s => s.category === 'XR World');
    expect(studio).toHaveLength(3);
    expect(xrWorld).toHaveLength(6);
    expect(SERVICES_DATA).toHaveLength(9);
  });

  test('studio services match spec', () => {
    const studio = SERVICES_DATA.filter(s => s.category === 'Studio').map(s => s.name);
    expect(studio).toContain('Interior Still Renders');
    expect(studio).toContain('Exterior Still Renders');
    expect(studio).toContain('Animation / Walkthrough');
  });

  test('xr world services match spec', () => {
    const xrWorld = SERVICES_DATA.filter(s => s.category === 'XR World').map(s => s.name);
    expect(xrWorld).toContain('WebXR');
    expect(xrWorld).toContain('WebAR');
    expect(xrWorld).toContain('Virtual Reality');
    expect(xrWorld).toContain('Virtual Tours');
    expect(xrWorld).toContain('Gaussian Splatting');
    expect(xrWorld).toContain('Pixel Streaming');
  });

  test('portfolio categories match website', () => {
    const ids = PORTFOLIO_CATEGORIES.map(c => c.id);
    expect(ids).toContain('exterior');
    expect(ids).toContain('interior');
    expect(ids).toContain('walkthrough');
    expect(ids).toContain('xr');
    expect(ids).toContain('360');
  });

  test('portfolio categories have correct names', () => {
    const names = PORTFOLIO_CATEGORIES.map(c => c.name);
    expect(names).toContain('Exterior Visualization');
    expect(names).toContain('Interior Visualization');
    expect(names).toContain('Architectural Animation');
    expect(names).toContain('Immersive XR Experiences');
    expect(names).toContain('Virtual Tours');
  });

  test('contact info has verified email', () => {
    expect(CONTACT_INFO.email).toBe('hello@viztr.studio');
  });

  test('contact info has verified phone numbers', () => {
    expect(CONTACT_INFO.phoneUS).toBe('+1 (212) 555-0198');
    expect(CONTACT_INFO.phoneUK).toBe('+44 20 7946 0912');
  });

  test('contact info has office addresses', () => {
    expect(CONTACT_INFO.addressUS).toContain('New York');
    expect(CONTACT_INFO.addressUK).toContain('London');
    expect(CONTACT_INFO.addressUAE).toContain('Dubai');
    expect(CONTACT_INFO.addressJP).toContain('Tokyo');
  });

  test('community links have both WhatsApp URLs', () => {
    expect(COMMUNITY_LINKS.whatsappChannel).toBe('https://whatsapp.com/channel/0029VbE5HKOGehEROUogwP3Q');
    expect(COMMUNITY_LINKS.whatsappCommunity).toBe('https://chat.whatsapp.com/EAMNiC7HDLVFMXzH7oPrvd');
  });

  test('telegram channel is not configured', () => {
    expect(COMMUNITY_LINKS.telegramChannel).toBeUndefined();
  });

  test('privacy URL is correct', () => {
    expect(PRIVACY_URL).toBe('https://viztr.in/privacy-policy');
  });

  test('getSiteUrl returns env value', () => {
    expect(getSiteUrl()).toBe('https://viztr.in');
  });

  test('support info contains contact details', () => {
    expect(SUPPORT_INFO).toContain('hello@viztr.studio');
    expect(SUPPORT_INFO).toContain('viztr.in');
  });
});