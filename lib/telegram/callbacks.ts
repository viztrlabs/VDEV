/**
 * Telegram Bot Callback Query Handlers
 * Handles all inline keyboard callback queries
 */

import { TelegramClient } from './client';
import type { TelegramCallbackQuery, TelegramInlineKeyboardMarkup } from './types';
import { parseCallbackData } from './validation';
import {
  ABOUT_TEXT,
  SERVICES_DATA,
  PORTFOLIO_CATEGORIES,
  CONTACT_INFO,
  getSiteUrl,
} from './content';
import {
  mainMenuKeyboard,
  servicesKeyboard,
  studioServicesKeyboard,
  xrWorldServicesKeyboard,
  portfolioKeyboard,
  contactKeyboard,
  helpKeyboard,
} from './keyboards';

/** Context for callback handlers */
export interface CallbackContext {
  client: TelegramClient;
  callbackQuery: TelegramCallbackQuery;
}

/** Handle callback query */
export async function handleCallbackQuery(
  client: TelegramClient,
  callbackQuery: TelegramCallbackQuery
): Promise<void> {
  const { id, data, message, from } = callbackQuery;
  const chatId = message?.chat?.id || from?.id;

  if (!chatId) {
    console.warn('[callbacks] No chat ID available for callback query');
    return;
  }

  const parsed = parseCallbackData(data);
  if (!parsed) {
    await answerCallback(client, id, 'Unknown action', true);
    return;
  }

  const { action, param } = parsed;

  try {
    // Full callback data (e.g. "portfolio:web:exterior") for handlers that need the raw value.
    const fullData = data || '';

    switch (action) {
      case 'about':
        await handleAbout(client, chatId, message?.message_id);
        break;
      case 'start':
        await handleMainMenu(client, chatId, message?.message_id);
        break;
      case 'help':
        await handleHelp(client, chatId, message?.message_id);
        break;
      case 'services':
        if (param === 'studio') {
          await handleStudioServices(client, chatId, message?.message_id);
        } else if (param === 'xrworld') {
          await handleXRWorldServices(client, chatId, message?.message_id);
        } else {
          await handleServices(client, chatId, message?.message_id);
        }
        break;
      case 'portfolio':
        // "portfolio:web:exterior" → website link, "portfolio:exterior" → category detail
        if (param) {
          await handlePortfolioCategory(client, chatId, message?.message_id, fullData);
        } else {
          await handlePortfolio(client, chatId, message?.message_id);
        }
        break;
      case 'contact':
        await handleContact(client, chatId, message?.message_id);
        break;
      case 'quote':
        await handleQuote(client, chatId, message?.message_id);
        break;
      case 'back':
        await handleBack(client, chatId, message?.message_id, param);
        break;
      case 'service':
        await handleServiceDetail(client, chatId, message?.message_id, param);
        break;
      default:
        await answerCallback(client, id, `Unknown action: ${action}`, true);
        return;
    }
    // Always answer callback to clear loading state
    await answerCallback(client, id);
  } catch (error) {
    console.error('[callbacks] Error handling callback:', error);
    await answerCallback(client, id, 'Error processing request', true);
  }
}

/** Answer callback query */
async function answerCallback(
  client: TelegramClient,
  callbackQueryId: string,
  text?: string,
  showAlert = false
): Promise<void> {
  await client.answerCallbackQuery(callbackQueryId, text, { show_alert: showAlert });
}

/** Edit message with new text and keyboard */
async function editMessage(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined,
  text: string,
  keyboard: TelegramInlineKeyboardMarkup
): Promise<void> {
  if (!messageId) return;
  await client.editMessageText(chatId, messageId, text, {
    reply_markup: keyboard,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

/** Handlers for each callback action */

async function handleAbout(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  await editMessage(client, chatId, messageId, ABOUT_TEXT, mainMenuKeyboard());
}

async function handleMainMenu(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  const welcomeText = `Welcome to VizTR
Visualize \u2726 Experience \u2726 Transform

Welcome to the VizTR ecosystem — Architectural Visualization, 3D Design, XR and Immersive Technology.

Explore our services, projects and community.`;
  await editMessage(client, chatId, messageId, welcomeText, mainMenuKeyboard());
}

async function handleHelp(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  const helpText = `VizTR Bot — Available Commands

<b>Navigation</b>
/start — Welcome menu with quick actions
/help — Show this help message

<b>Information</b>
/about — About VizTR studio
/services — Our services (Studio & XR World)
/portfolio — Portfolio categories & projects
/website — Open VizTR website
/community — WhatsApp Channel & Community

<b>Contact & Support</b>
/contact — Verified contact details
/support — Support & project enquiry
/privacy — Privacy policy

Use the inline buttons for quick navigation, or type any command above.`;
  await editMessage(client, chatId, messageId, helpText, helpKeyboard());
}

async function handleStudioServices(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  const studio = SERVICES_DATA.filter(s => s.category === 'Studio');
  const list = studio.map(s => `\u2022 ${s.name}`).join('\n');
  const text = `<b>Studio</b> — Commercial Visualization Production

${list}

Select a service for details:`;
  await editMessage(client, chatId, messageId, text, studioServicesKeyboard());
}

async function handleXRWorldServices(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  const xr = SERVICES_DATA.filter(s => s.category === 'XR World');
  const list = xr.map(s => `\u2022 ${s.name}`).join('\n');
  const text = `<b>XR World</b> — Commercial Immersive Experience Delivery

${list}

Select a service for details:`;
  await editMessage(client, chatId, messageId, text, xrWorldServicesKeyboard());
}

async function handleQuote(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  const text = `Get a Quote

Tell us about your project and receive an itemized proposal within 24 hours.

\u2022 Website: ${getSiteUrl()}/book-consultation
\u2022 Email: ${CONTACT_INFO.email}

Or use the button below to start your brief.`;
  await editMessage(client, chatId, messageId, text, {
    inline_keyboard: [
      [{ text: 'Book Consultation', url: `${getSiteUrl()}/book-consultation` }],
      [{ text: 'Back to Main Menu', callback_data: 'back:main' }],
    ],
  });
}

async function handleServices(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
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

  await editMessage(client, chatId, messageId, servicesText, servicesKeyboard());
}

async function handleServiceDetail(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined,
  serviceId?: string
): Promise<void> {
  if (!serviceId) {
    await handleServices(client, chatId, messageId);
    return;
  }

  const service = SERVICES_DATA.find(s => s.id === serviceId);
  if (!service) {
    await handleServices(client, chatId, messageId);
    return;
  }

  const serviceText = `${service.name}

${service.description}

Category: ${service.category}
${service.link ? `\nLearn more: ${service.link}` : ''}`;

  await editMessage(client, chatId, messageId, serviceText, {
    inline_keyboard: [
      [{ text: 'Back to Services', callback_data: 'back:services' }],
    ],
  });
}

async function handlePortfolio(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
  const categoriesText = PORTFOLIO_CATEGORIES.map(c =>
    `\u2022 ${c.name} (${c.count} project${c.count !== 1 ? 's' : ''})`
  ).join('\n');

  const portfolioText = `Portfolio Categories

${categoriesText}

Select a category to view projects or visit our website for full case studies.`;

  await editMessage(client, chatId, messageId, portfolioText, portfolioKeyboard());
}

async function handlePortfolioCategory(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined,
  action: string
): Promise<void> {
  // action format: portfolio:exterior, portfolio:web:exterior
  const parts = action.split(':');
  if (parts.length < 2) {
    await handlePortfolio(client, chatId, messageId);
    return;
  }

  const categoryId = parts[1];
  const isWebLink = parts[0] === 'portfolio' && parts[1] === 'web';

  if (isWebLink) {
    // parts = ['portfolio', 'web', 'exterior']
    const catId = parts[2];
    const category = PORTFOLIO_CATEGORIES.find(c => c.id === catId);
    if (category) {
      const text = `${category.name}

View full case studies on our website:
${getSiteUrl()}/portfolio`;
      await editMessage(client, chatId, messageId, text, {
        inline_keyboard: [
          [{ text: 'Open on Website', url: `${getSiteUrl()}/portfolio` }],
          [{ text: 'Back to Portfolio', callback_data: 'back:portfolio' }],
        ],
      });
    }
    return;
  }

  const category = PORTFOLIO_CATEGORIES.find(c => c.id === categoryId);
  if (!category) {
    await handlePortfolio(client, chatId, messageId);
    return;
  }

  const text = `${category.name}

${category.description}

${category.count} project${category.count !== 1 ? 's' : ''} available.

Visit our website for full case studies and project details.`;

  await editMessage(client, chatId, messageId, text, {
    inline_keyboard: [
      [{ text: 'View on Website', url: `${getSiteUrl()}/portfolio` }],
      [{ text: 'Back to Portfolio', callback_data: 'back:portfolio' }],
    ],
  });
}

async function handleContact(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined
): Promise<void> {
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

  await editMessage(client, chatId, messageId, text, contactKeyboard());
}

async function handleBack(
  client: TelegramClient,
  chatId: number | string,
  messageId: number | undefined,
  target?: string
): Promise<void> {
  switch (target) {
    case 'main':
      const welcomeText = `Welcome to VizTR
Visualize \u2726 Experience \u2726 Transform

Welcome back! Explore our services, projects and community.`;
      await editMessage(client, chatId, messageId, welcomeText, mainMenuKeyboard());
      break;
    case 'services':
      await handleServices(client, chatId, messageId);
      break;
    case 'portfolio':
      await handlePortfolio(client, chatId, messageId);
      break;
    default:
      await handleMainMenu(client, chatId, messageId);
  }
}