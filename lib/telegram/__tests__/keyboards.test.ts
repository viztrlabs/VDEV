import {
  mainMenuKeyboard,
  servicesKeyboard,
  studioServicesKeyboard,
  xrWorldServicesKeyboard,
  portfolioKeyboard,
  communityKeyboard,
  contactKeyboard,
  supportKeyboard,
  privacyKeyboard,
  socialLinksKeyboard,
  backKeyboard,
  urlButton,
  callbackButton,
} from '@/lib/telegram/keyboards';

describe('Inline Keyboard Builders', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_SITE_URL = 'https://viztr.in';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('urlButton', () => {
    test('creates URL button', () => {
      const btn = urlButton('Website', 'https://viztr.in');
      expect(btn.text).toBe('Website');
      expect(btn.url).toBe('https://viztr.in');
      expect(btn.callback_data).toBeUndefined();
    });
  });

  describe('callbackButton', () => {
    test('creates callback button', () => {
      const btn = callbackButton('About', 'about');
      expect(btn.text).toBe('About');
      expect(btn.callback_data).toBe('about');
      expect(btn.url).toBeUndefined();
    });
  });

  describe('mainMenuKeyboard', () => {
    test('has 5 rows with correct buttons', async () => {
      const kb = await mainMenuKeyboard();
      expect(kb.inline_keyboard).toHaveLength(5);
    });

    test('row 1: About VizTR | Our Services', async () => {
      const kb = await mainMenuKeyboard();
      const row1 = kb.inline_keyboard[0];
      expect(row1).toHaveLength(2);
      expect(row1[0].text).toBe('About VizTR');
      expect(row1[0].callback_data).toBe('about');
      expect(row1[1].text).toBe('Our Services');
      expect(row1[1].callback_data).toBe('services');
    });

    test('row 2: Portfolio | Get a Quote', async () => {
      const kb = await mainMenuKeyboard();
      const row2 = kb.inline_keyboard[1];
      expect(row2).toHaveLength(2);
      expect(row2[0].callback_data).toBe('portfolio');
      expect(row2[1].callback_data).toBe('quote');
    });

    test('row 3: Website (URL) | Contact', async () => {
      const kb = await mainMenuKeyboard();
      const row3 = kb.inline_keyboard[2];
      expect(row3).toHaveLength(2);
      expect(row3[0].text).toBe('Website');
      expect(row3[0].url).toBe('https://viztr.in');
      expect(row3[1].callback_data).toBe('contact');
    });

    test('row 4: WhatsApp Channel | WhatsApp Community (both URL)', async () => {
      const kb = await mainMenuKeyboard();
      const row4 = kb.inline_keyboard[3];
      expect(row4).toHaveLength(2);
      expect(row4[0].url).toContain('whatsapp.com/channel');
      expect(row4[1].url).toContain('chat.whatsapp.com');
    });

    test('row 5: Social Media', async () => {
      const kb = await mainMenuKeyboard();
      const row5 = kb.inline_keyboard[4];
      expect(row5).toHaveLength(1);
      expect(row5[0].text).toBe('Social Media');
      expect(row5[0].callback_data).toBe('socials');
    });
  });

  describe('servicesKeyboard', () => {
    test('has Studio and XR World', async () => {
      const kb = await servicesKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('services:studio');
      expect(callbacks).toContain('services:xrworld');
      expect(callbacks).toContain('back:main');
    });

    test('has back button', async () => {
      const kb = await servicesKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('studioServicesKeyboard', () => {
    test('has 3 studio services', async () => {
      const kb = await studioServicesKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('service:interior_renders');
      expect(callbacks).toContain('service:exterior_renders');
      expect(callbacks).toContain('service:animation_walkthrough');
    });

    test('has back to services', async () => {
      const kb = await studioServicesKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:services');
    });
  });

  describe('xrWorldServicesKeyboard', () => {
    test('has 6 XR World services', async () => {
      const kb = await xrWorldServicesKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('service:webxr');
      expect(callbacks).toContain('service:webar');
      expect(callbacks).toContain('service:virtual_reality');
      expect(callbacks).toContain('service:virtual_tours');
      expect(callbacks).toContain('service:gaussian_splatting');
      expect(callbacks).toContain('service:pixel_streaming');
    });

    test('has back to services', async () => {
      const kb = await xrWorldServicesKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:services');
    });
  });

  describe('portfolioKeyboard', () => {
    test('has all 5 portfolio categories', async () => {
      const kb = await portfolioKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('portfolio:exterior');
      expect(callbacks).toContain('portfolio:interior');
      expect(callbacks).toContain('portfolio:walkthrough');
      expect(callbacks).toContain('portfolio:xr');
      expect(callbacks).toContain('portfolio:360');
    });

    test('has back to main', async () => {
      const kb = await portfolioKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('communityKeyboard', () => {
    test('has both WhatsApp links as URL buttons', async () => {
      const kb = await communityKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://whatsapp.com/channel/0029VbE5HKOGehEROUogwP3Q');
      expect(urls).toContain('https://chat.whatsapp.com/EAMNiC7HDLVFMXzH7oPrvd');
    });

    test('has back to main', async () => {
      const kb = await communityKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('contactKeyboard', () => {
    test('has website and book consultation URLs', async () => {
      const kb = await contactKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://viztr.in');
      expect(urls).toContain('https://viztr.in/book-consultation');
    });
  });

  describe('supportKeyboard', () => {
    test('has website and book consultation URLs', async () => {
      const kb = await supportKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://viztr.in');
      expect(urls).toContain('https://viztr.in/book-consultation');
    });

    test('has back to main', async () => {
      const kb = await supportKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('privacyKeyboard', () => {
    test('has privacy URL and back button', async () => {
      const kb = await privacyKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://viztr.in/privacy-policy');
      expect(kb.inline_keyboard[1][0].callback_data).toBe('back:main');
    });
  });

  describe('socialLinksKeyboard', () => {
    test('has all 10 social links as URL buttons', async () => {
      const kb = await socialLinksKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://instagram.com/viztr_official');
      expect(urls).toContain('https://threads.com/@viztr_official');
      expect(urls).toContain('https://x.com/viztr_official');
      expect(urls).toContain('https://facebook.com/profile.php?id=61581506345579');
      expect(urls).toContain('https://linkedin.com/in/viztrofficial');
      expect(urls).toContain('https://discord.com/users/1422537346380730459');
      expect(urls).toContain('https://discord.gg/XKFwVBxSDR');
      expect(urls).toContain('https://t.me/viztr_bot');
      expect(urls).toContain('https://www.youtube.com/@VizTR_Official/community');
      expect(urls).toContain('https://viztr.in');
    });

    test('has 10 rows', async () => {
      const kb = await socialLinksKeyboard();
      expect(kb.inline_keyboard).toHaveLength(10);
    });
  });

  describe('backKeyboard', () => {
    test('returns single button with correct callback', () => {
      const kb = backKeyboard('back:main');
      expect(kb.inline_keyboard).toHaveLength(1);
      expect(kb.inline_keyboard[0]).toHaveLength(1);
      expect(kb.inline_keyboard[0][0].callback_data).toBe('back:main');
    });
  });
});
