/**
 * User Profile and Stats Types
 */

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  level: number;
  currentXP: number;
  totalXP: number;
  xpForNextLevel: number;
  progressPercent: number;
  achievementsCount: number;
  streakDays: number;
  totalFractionsDonated: number;
  totalAmountDonated: number;
  roundsParticipated: number;
}

export interface UserLevel {
  level: number;
  xpRequired: number;
  xpRange: {
    min: number;
    max: number;
  };
  title: string;
  benefits: string[];
  icon: string;
}
