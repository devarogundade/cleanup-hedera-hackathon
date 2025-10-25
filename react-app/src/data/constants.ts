/**
 * Data Layer - Application Constants
 * Central location for all app-wide constants and configuration
 */

export const APP_CONFIG = {
  NAME: "CleanUp",
  TAGLINE: "Making environmental impact transparent and rewarding",
  NGN_TO_HBAR_RATE: 239.15,
  HBAR_TO_XP_RATE: 1000,
  HBAR_CURRENCY: "HBAR",
  NGN_CURRENCY: "NGN",
  XP_CURRENCY: "XP",
} as const;

export const XP_SYSTEM = {
  PER_FRACTION: 10,
  LEVEL_MULTIPLIER: 100,
} as const;

export const ROUTES = {
  HOME: "/",
  APP: "/app",
  APP_ROUND: (roundId: number) => `/app/${roundId}`,
  GAME_PLAY: (roundId: number) => `/app/${roundId}/play`,
  REWARDS: "/rewards",
  LEADERBOARD: "/leaderboard",
  HOW_IT_WORKS: "/how-it-works",
  FAQ: "/faq",
} as const;

export const SOCIAL_LINKS = {
  TWITTER: "#",
  DISCORD: "#",
} as const;

interface Level {
  level: number;
  xpRequired: number;
  title: string;
  rewards: string[];
}

export const XP_LEVELS: Level[] = [
  {
    level: 1,
    xpRequired: 0,
    title: "Eco Newbie",
    rewards: ["Welcome Badge", "First Step NFT"],
  },
  {
    level: 2,
    xpRequired: 100,
    title: "Green Starter",
    rewards: ["Starter Badge", "+5% Voting Power"],
  },
  {
    level: 3,
    xpRequired: 250,
    title: "Waste Warrior",
    rewards: ["Warrior Badge", "Special Avatar Frame"],
  },
  {
    level: 4,
    xpRequired: 500,
    title: "Clean Champion",
    rewards: ["Champion Badge", "+10% Voting Power"],
  },
  {
    level: 5,
    xpRequired: 1000,
    title: "Eco Guardian",
    rewards: ["Guardian Badge", "Exclusive NFT Design"],
  },
  {
    level: 6,
    xpRequired: 2000,
    title: "Planet Protector",
    rewards: ["Protector Badge", "+15% Voting Power"],
  },
  {
    level: 7,
    xpRequired: 3500,
    title: "Eco Warrior",
    rewards: ["Elite Badge", "Premium Avatar Frames"],
  },
  {
    level: 8,
    xpRequired: 5500,
    title: "Nature's Hero",
    rewards: ["Hero Badge", "+20% Voting Power", "Custom Profile Theme"],
  },
  {
    level: 9,
    xpRequired: 8000,
    title: "Earth Savior",
    rewards: ["Savior Badge", "Legendary NFT", "VIP Discord Role"],
  },
  {
    level: 10,
    xpRequired: 12000,
    title: "Eco Legend",
    rewards: [
      "Legend Badge",
      "+30% Voting Power",
      "Hall of Fame Entry",
      "Ultra Rare NFT",
    ],
  },
];
