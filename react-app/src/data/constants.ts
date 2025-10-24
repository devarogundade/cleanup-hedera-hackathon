/**
 * Data Layer - Application Constants
 * Central location for all app-wide constants and configuration
 */

export const APP_CONFIG = {
  NAME: "CleanUp",
  TAGLINE: "Making environmental impact transparent and rewarding",
  NGN_TO_HBAR_RATE: 239.15,
  HBAR_CURRENCY: "HBAR",
  NGN_CURRENCY: "NGN",
} as const;

export const XP_SYSTEM = {
  PER_FRACTION: 10,
  LEVEL_MULTIPLIER: 100,
} as const;

export const ROUTES = {
  HOME: "/",
  APP: "/app",
  APP_ROUND: (roundId: number) => `/app/${roundId}`,
  REWARDS: "/rewards",
  LEADERBOARD: "/leaderboard",
  HOW_IT_WORKS: "/how-it-works",
  FAQ: "/faq",
} as const;

export const SOCIAL_LINKS = {
  TWITTER: "#",
  DISCORD: "#",
} as const;
