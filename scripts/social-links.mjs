/**
 * VizTR Telegram Bot - Social Links Configuration
 * Centralized configuration for all official social media links.
 * Used by command handlers and inline keyboards.
 */

export const SOCIAL_LINKS = {
  // Official social media links (use exactly as provided)
  INSTAGRAM: 'https://instagram.com/viztr_official',
  THREADS: 'https://threads.com/@viztr_official',
  X: 'https://x.com/viztr_official',
  FACEBOOK: 'https://facebook.com/profile.php?id=61581506345579',
  DISCORD_PROFILE: 'https://discord.com/users/1422537346380730459',
  DISCORD_SERVER: 'https://discord.gg/XKFwVBxSDR',
  LINKEDIN: 'https://linkedin.com/in/viztrofficial',
  TELEGRAM_BOT: 'https://t.me/viztr_bot',
  YOUTUBE_COMMUNITY: 'https://www.youtube.com/@VizTR_Official/community',

  // Derived links
  WEBSITE: 'https://viztr.studio',

  // Keyboard labels
  labels: {
    INSTAGRAM: 'Instagram',
    THREADS: 'Threads',
    X: 'X',
    FACEBOOK: 'Facebook',
    LINKEDIN: 'LinkedIn',
    DISCORD_PROFILE: 'Discord Profile',
    DISCORD_SERVER: 'Discord Server',
    TELEGRAM_BOT: 'Telegram Bot',
    YOUTUBE_COMMUNITY: 'YouTube Community',
    WEBSITE: 'Visit VizTR Website',
  },
};

// Export individual links for convenience
export const {
  INSTAGRAM,
  THREADS,
  X,
  FACEBOOK,
  DISCORD_PROFILE,
  DISCORD_SERVER,
  LINKEDIN,
  TELEGRAM_BOT,
  YOUTUBE_COMMUNITY,
  WEBSITE,
  labels,
} = SOCIAL_LINKS;