/**
 * Inline Keyboard Builders for Telegram Bot
 * Creates all inline keyboards used in the bot
 */

import type { TelegramInlineKeyboardMarkup, TelegramInlineKeyboardButton } from './types';
import { COMMUNITY_LINKS, getSiteUrl } from './content';

/** Create a URL button */
export function urlButton(text: string, url: string): TelegramInlineKeyboardButton {
  return { text, url };
}

/** Create a callback data button */
export function callbackButton(text: string, callbackData: string): TelegramInlineKeyboardButton {
  return { text, callback_data: callbackData };
}

/** Main Menu Keyboard - 4 rows per spec */
export async function mainMenuKeyboard(): Promise<TelegramInlineKeyboardMarkup> {
  const siteUrl = await getSiteUrl();
  return {
    inline_keyboard: [
      // Row 1: About VizTR | Our Services
      [callbackButton('About VizTR', 'about'), callbackButton('Our Services', 'services')],
      // Row 2: Portfolio | Get a Quote
      [callbackButton('Portfolio', 'portfolio'), callbackButton('Get a Quote', 'quote')],
      // Row 3: Website | Contact
      [urlButton('Website', siteUrl), callbackButton('Contact', 'contact')],
      // Row 4: WhatsApp Channel | WhatsApp Community
      [
        urlButton('WhatsApp Channel', COMMUNITY_LINKS.whatsappChannel),
        urlButton('WhatsApp Community', COMMUNITY_LINKS.whatsappCommunity),
      ],
    ],
  };
}

/** Services Category Keyboard */
export function servicesKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('Studio (Visualization)', 'services:studio')],
      [callbackButton('XR World (Immersive)', 'services:xrworld')],
      [callbackButton('Back to Main Menu', 'back:main')],
    ],
  };
}

/** Studio Services Keyboard */
export function studioServicesKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('Interior Still Renders', 'service:interior_renders')],
      [callbackButton('Exterior Still Renders', 'service:exterior_renders')],
      [callbackButton('Animation / Walkthrough', 'service:animation_walkthrough')],
      [callbackButton('Back to Services', 'back:services')],
    ],
  };
}

/** XR World Services Keyboard */
export function xrWorldServicesKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('WebXR', 'service:webxr')],
      [callbackButton('WebAR', 'service:webar')],
      [callbackButton('Virtual Reality', 'service:virtual_reality')],
      [callbackButton('Virtual Tours', 'service:virtual_tours')],
      [callbackButton('Gaussian Splatting', 'service:gaussian_splatting')],
      [callbackButton('Pixel Streaming', 'service:pixel_streaming')],
      [callbackButton('Back to Services', 'back:services')],
    ],
  };
}

/** Individual Service Detail Keyboard */
export function serviceDetailKeyboard(serviceId: string): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('Back to Services', 'back:services')],
    ],
  };
}

/** Portfolio Categories Keyboard */
export function portfolioKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('Exterior Visualization', 'portfolio:exterior')],
      [callbackButton('Interior Visualization', 'portfolio:interior')],
      [callbackButton('Architectural Animation', 'portfolio:walkthrough')],
      [callbackButton('Immersive XR Experiences', 'portfolio:xr')],
      [callbackButton('Virtual Tours', 'portfolio:360')],
      [callbackButton('Back to Main Menu', 'back:main')],
    ],
  };
}

/** Portfolio Category Detail Keyboard */
export function portfolioCategoryKeyboard(categoryId: string): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('View on Website', `portfolio:web:${categoryId}`)],
      [callbackButton('Back to Portfolio', 'back:portfolio')],
    ],
  };
}

/** Community Links Keyboard (URL buttons) */
export function communityKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [urlButton('WhatsApp Channel', COMMUNITY_LINKS.whatsappChannel)],
      [urlButton('WhatsApp Community', COMMUNITY_LINKS.whatsappCommunity)],
      [callbackButton('Back to Main Menu', 'back:main')],
    ],
  };
}

/** Contact Keyboard */
export async function contactKeyboard(): Promise<TelegramInlineKeyboardMarkup> {
  const siteUrl = await getSiteUrl();
  return {
    inline_keyboard: [
      [urlButton('Visit Website', siteUrl)],
      [urlButton('Book Consultation', `${siteUrl}/book-consultation`)],
      [callbackButton('Back to Main Menu', 'back:main')],
    ],
  };
}

/** Support Keyboard */
export async function supportKeyboard(): Promise<TelegramInlineKeyboardMarkup> {
  const siteUrl = await getSiteUrl();
  return {
    inline_keyboard: [
      [urlButton('Contact Us', siteUrl)],
      [urlButton('Book Consultation', `${siteUrl}/book-consultation`)],
      [callbackButton('Back to Main Menu', 'back:main')],
    ],
  };
}

/** Privacy Keyboard */
export function privacyKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [urlButton('Read Privacy Policy', 'https://viztr.in/privacy-policy')],
      [callbackButton('Back to Main Menu', 'back:main')],
    ],
  };
}

/** Generic Back Button Keyboard */
export function backKeyboard(callbackData: string): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('Back', callbackData)],
    ],
  };
}

/** Help Keyboard */
export function helpKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [callbackButton('Start Over', 'start')],
      [callbackButton('Main Menu', 'back:main')],
    ],
  };
}