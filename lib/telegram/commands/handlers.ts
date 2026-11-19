/**
 * Telegram Bot Command Handlers
 * Implements all 11 command handlers
 */

import { TelegramClient } from '../client';
import type { TelegramInlineKeyboardMarkup } from '../types';
import {
  ABOUT_TEXT,
  PORTFOLIO_CATEGORIES,
  CONTACT_INFO,
  COMMUNITY_LINKS,
  PRIVACY_URL,
  SOCIAL_LINKS,
  getSiteUrl,
  getSupportInfo,
} from '../content';
import {
  mainMenuKeyboard,
  servicesKeyboard,
  portfolioKeyboard,
  socialLinksKeyboard,
  communityKeyboard,
  contactKeyboard,
  supportKeyboard,
  privacyKeyboard,
  helpKeyboard,
} from '../keyboards';

/** Command handler function type */
export type CommandHandler = (ctx: CommandContext) => Promise<void>;

/** Command context with typed client */
export interface CommandContext {
  client: TelegramClient;
  chatId: number | string;
  from: { id: number; first_name?: string; username?: string };
  messageId?: number;
}

/** Safe HTML escape for user content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

/** Send message with keyboard helper */
async function sendWithKeyboard(
  client: TelegramClient,
  chatId: number | string,
  text: string,
  keyboard: TelegramInlineKeyboardMarkup
): Promise<void> {
  await client.sendMessage(chatId, text, {
    reply_markup: keyboard,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

/** /start - Welcome with Main Menu */
export async function handleStart(ctx: CommandContext): Promise<void> {
  const { client, chatId, from } = ctx;
  const name = escapeHtml(from.first_name || 'there');

  const welcomeText = `Welcome to VizTR
Visualize \u2726 Experience \u2726 Transform

Hello ${name}! Welcome to the VizTR ecosystem \u2014 Architectural Visualization, 3D Design, XR and Immersive Technology.

Explore our services, projects and community.`;

  await sendWithKeyboard(client, chatId, welcomeText, await mainMenuKeyboard());
}

/** /help - Command Reference */
export async function handleHelp(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const helpText = `VizTR Bot \u2014 Available Commands

<b>Navigation</b>
/start \u2014 Welcome menu with quick actions
/help \u2014 Show this help message

<b>Information</b>
/about \u2014 About VizTR studio
/services \u2014 Our services (Studio & XR World)
/portfolio \u2014 Portfolio categories & projects
/website \u2014 Open VizTR website
/channel \u2014 Telegram channel (not configured)
/community \u2014 WhatsApp Channel & Community
/socials \u2014 Follow VizTR on social media

<b>Contact & Support</b>
/contact \u2014 Verified contact details
/support \u2014 Support & project enquiry
/privacy \u2014 Privacy policy

Use the inline buttons for quick navigation, or type any command above.`;

  await sendWithKeyboard(client, chatId, helpText, helpKeyboard());
}

/** /about - Brand Description */
export async function handleAbout(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  await sendWithKeyboard(client, chatId, ABOUT_TEXT, await mainMenuKeyboard());
}

/** /services - Service Categories */
export async function handleServices(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const servicesText = `Our Services

<b>Studio</b> \u2014 Commercial Visualization Production
\u2022 Interior Still Renders
\u2022 Exterior Still Renders
\u2022 Animation / Walkthrough

<b>XR World</b> \u2014 Commercial Immersive Experience Delivery
\u2022 WebXR
\u2022 WebAR
\u2022 Virtual Reality
\u2022 Virtual Tours
\u2022 Gaussian Splatting
\u2022 Pixel Streaming

Select a category to explore services:`;

  await sendWithKeyboard(client, chatId, servicesText, servicesKeyboard());
}

/** /portfolio - Portfolio Categories */
export async function handlePortfolio(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const categoriesText = PORTFOLIO_CATEGORIES.map(c =>
    `\u2022 ${c.name} (${c.count} project${c.count !== 1 ? 's' : ''})`
  ).join('\n');

  const portfolioText = `Portfolio Categories

${categoriesText}

Select a category to view projects or visit our website for full case studies.`;

  await sendWithKeyboard(client, chatId, portfolioText, portfolioKeyboard());
}

/** /website - Open Website */
export async function handleWebsite(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;
  const siteUrl = await getSiteUrl();

  const text = `Visit our website for full portfolio, services, and enquiry forms:

${siteUrl}`;

  await sendWithKeyboard(client, chatId, text, {
    inline_keyboard: [[{ text: 'Open Website', url: siteUrl }], [{ text: 'Back to Main Menu', callback_data: 'back:main' }]],
  });
}

/** /channel - Telegram Channel (Not Configured) */
export async function handleChannel(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const text = `Telegram Channel

Our official Telegram channel is not yet configured.

Please check back later or follow our other channels for updates.`;

  await sendWithKeyboard(client, chatId, text, await mainMenuKeyboard());
}

/** /community - WhatsApp Links */
export async function handleCommunity(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const text = `Community Links

<b>WhatsApp Channel</b> (Broadcast \u2014 no member visibility)
${COMMUNITY_LINKS.whatsappChannel}

<b>WhatsApp Community</b> (Discussion Group)
${COMMUNITY_LINKS.whatsappCommunity}

<b>Note:</b> WhatsApp Channel is a broadcast list \u2014 members cannot see each other. The Community is a discussion group where participants are visible.`;

  await sendWithKeyboard(client, chatId, text, communityKeyboard());
}

/** /contact - Verified Contact Info */
export async function handleContact(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const text = `Contact VizTR

<b>Email:</b> ${CONTACT_INFO.email}
<b>US Phone:</b> ${CONTACT_INFO.phoneUS}
<b>UK Phone:</b> ${CONTACT_INFO.phoneUK}

<b>Office Locations:</b>
\uD83C\uDDFA\uD83C\uDDF8 ${CONTACT_INFO.addressUS}
\uD83C\uDDEC\uD83C\uDDE7 ${CONTACT_INFO.addressUK}
\uD83C\uDDE6\uD83C\uDDEA ${CONTACT_INFO.addressUAE}
\uD83C\uDDEF\uD83C\uDDF5 ${CONTACT_INFO.addressJP}

<b>Production:</b> ${CONTACT_INFO.productionHours}

For project enquiries, use the website form for fastest response.`;

  await sendWithKeyboard(client, chatId, text, await contactKeyboard());
}

/** /support - Support Instructions */
export async function handleSupport(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const supportInfo = await getSupportInfo();
  await sendWithKeyboard(client, chatId, supportInfo, await supportKeyboard());
}

/** /privacy - Privacy Policy */
export async function handlePrivacy(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const text = `Privacy Policy

Our privacy policy is available at:
${PRIVACY_URL}

It covers:
\u2022 Architectural confidentiality & NDA
\u2022 Data collection & security
\u2022 WebXR session telemetry
\u2022 Contact information for data requests`;

  await sendWithKeyboard(client, chatId, text, privacyKeyboard());
}

/** /socials - Social Media Links */
export async function handleSocials(ctx: CommandContext): Promise<void> {
  const { client, chatId } = ctx;

  const text = `Follow VizTR on Social Media

Connect with us across all platforms:
\u2022 Instagram: Visual inspiration and behind-the-scenes
\u2022 Threads: Real-time updates and conversations
\u2022 X: News and announcements
\u2022 Facebook: Community discussions
\u2022 LinkedIn: Professional network
\u2022 Discord Profile: Personal profile
\u2022 Discord Server: Community server
\u2022 Telegram Bot: This bot
\u2022 YouTube Community: Video content

Click any button below to visit our social pages.`;

  await sendWithKeyboard(client, chatId, text, await socialLinksKeyboard());
}

import { registerCommandHandler } from './registry';

/** Register all handlers */
export function registerAllHandlers(): void {
  registerCommandHandler('start', handleStart);
  registerCommandHandler('help', handleHelp);
  registerCommandHandler('about', handleAbout);
  registerCommandHandler('services', handleServices);
  registerCommandHandler('portfolio', handlePortfolio);
  registerCommandHandler('website', handleWebsite);
  registerCommandHandler('channel', handleChannel);
  registerCommandHandler('community', handleCommunity);
  registerCommandHandler('contact', handleContact);
  registerCommandHandler('support', handleSupport);
  registerCommandHandler('privacy', handlePrivacy);
  registerCommandHandler('socials', handleSocials);
}