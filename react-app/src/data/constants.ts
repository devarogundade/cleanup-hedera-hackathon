/**
 * Data Layer - Application Constants
 * Central location for all app-wide constants and configuration
 */

export const APP_CONFIG = {
  NAME: "CleanUp",
  TAGLINE: "Making environmental impact transparent and rewarding",
} as const;

export const XP_SYSTEM = {
  PER_FRACTION: 10,
  LEVEL_MULTIPLIER: 100,
  ACHIEVEMENTS: {
    FIRST_DONATION: { title: "First Impact", xp: 50 },
    FIRST_FIVE: {
      title: "First Five",
      description: "Selected 5 fractions in a single round!",
      xp: 50,
    },
    ECO_WARRIOR: { title: "Eco Warrior", xp: 100 },
    PLANET_HERO: { title: "Planet Hero", xp: 200 },
  },
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
