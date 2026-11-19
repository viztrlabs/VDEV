import {
  mainMenuKeyboard,
  servicesKeyboard,
  studioServicesKeyboard,
  xrWorldServicesKeyboard,
  portfolioKeyboard,
  communityKeyboard,
  contactKeyboard,
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
    test('has 4 rows with correct buttons', () => {
      const kb = mainMenuKeyboard();
      expect(kb.inline_keyboard).toHaveLength(4);
    });

    test('row 1: About VizTR | Our Services', () => {
      const kb = mainMenuKeyboard();
      const row1 = kb.inline_keyboard[0];
      expect(row1).toHaveLength(2);
      expect(row1[0].text).toBe('About VizTR');
      expect(row1[0].callback_data).toBe('about');
      expect(row1[1].text).toBe('Our Services');
      expect(row1[1].callback_data).toBe('services');
    });

    test('row 2: Portfolio | Get a Quote', () => {
      const kb = mainMenuKeyboard();
      const row2 = kb.inline_keyboard[1];
      expect(row2).toHaveLength(2);
      expect(row2[0].callback_data).toBe('portfolio');
      expect(row2[1].callback_data).toBe('quote');
    });

    test('row 3: Website (URL) | Contact', () => {
      const kb = mainMenuKeyboard();
      const row3 = kb.inline_keyboard[2];
      expect(row3).toHaveLength(2);
      expect(row3[0].text).toBe('Website');
      expect(row3[0].url).toBe('https://viztr.in');
      expect(row3[1].callback_data).toBe('contact');
    });

    test('row 4: WhatsApp Channel | WhatsApp Community (both URL)', () => {
      const kb = mainMenuKeyboard();
      const row4 = kb.inline_keyboard[3];
      expect(row4).toHaveLength(2);
      expect(row4[0].url).toContain('whatsapp.com/channel');
      expect(row4[1].url).toContain('chat.whatsapp.com');
    });
  });

  describe('servicesKeyboard', () => {
    test('has Studio and XR World', () => {
      const kb = servicesKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('services:studio');
      expect(callbacks).toContain('services:xrworld');
      expect(callbacks).toContain('back:main');
    });

    test('has back button', () => {
      const kb = servicesKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('studioServicesKeyboard', () => {
    test('has 3 studio services', () => {
      const kb = studioServicesKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('service:interior_renders');
      expect(callbacks).toContain('service:exterior_renders');
      expect(callbacks).toContain('service:animation_walkthrough');
    });

    test('has back to services', () => {
      const kb = studioServicesKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:services');
    });
  });

  describe('xrWorldServicesKeyboard', () => {
    test('has 6 XR World services', () => {
      const kb = xrWorldServicesKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('service:webxr');
      expect(callbacks).toContain('service:webar');
      expect(callbacks).toContain('service:virtual_reality');
      expect(callbacks).toContain('service:virtual_tours');
      expect(callbacks).toContain('service:gaussian_splatting');
      expect(callbacks).toContain('service:pixel_streaming');
    });

    test('has back to services', () => {
      const kb = xrWorldServicesKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:services');
    });
  });

  describe('portfolioKeyboard', () => {
    test('has all 5 portfolio categories', () => {
      const kb = portfolioKeyboard();
      const callbacks = kb.inline_keyboard.flat().map(b => b.callback_data).filter(Boolean);
      expect(callbacks).toContain('portfolio:exterior');
      expect(callbacks).toContain('portfolio:interior');
      expect(callbacks).toContain('portfolio:walkthrough');
      expect(callbacks).toContain('portfolio:xr');
      expect(callbacks).toContain('portfolio:360');
    });

    test('has back to main', () => {
      const kb = portfolioKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('communityKeyboard', () => {
    test('has both WhatsApp links as URL buttons', () => {
      const kb = communityKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://whatsapp.com/channel/0029VbE5HKOGehEROUogwP3Q');
      expect(urls).toContain('https://chat.whatsapp.com/EAMNiC7HDLVFMXzH7oPrvd');
    });

    test('has back to main', () => {
      const kb = communityKeyboard();
      const lastRow = kb.inline_keyboard[kb.inline_keyboard.length - 1];
      expect(lastRow[0].callback_data).toBe('back:main');
    });
  });

  describe('contactKeyboard', () => {
    test('has website and book consultation URLs', () => {
      const kb = contactKeyboard();
      const urls = kb.inline_keyboard.flat().map(b => b.url).filter(Boolean);
      expect(urls).toContain('https://viztr.in');
      expect(urls).toContain('https://viztr.in/book-consultation');
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