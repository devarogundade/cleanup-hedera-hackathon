/**
 * Reward and Achievement Types
 */

export type RewardType = "badge" | "achievement" | "reward";

export type RewardStatus = "locked" | "available" | "claimed";

export interface DeliveryInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  type: RewardType;
  claimed: boolean;
  status: RewardStatus;
  value: string;
  progress: string;
  progressCurrent: number;
  progressTotal: number;
  earnedDate: string | null;
  claimedDate?: string;
  icon?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  deliveryType?: "physical" | "digital";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  unlockedAt?: string;
  progress?: {
    current: number;
    total: number;
  };
}

export interface RewardStats {
  totalRewards: number;
  claimedRewards: number;
  availableRewards: number;
  totalValueClaimed: number;
  rewardsByType: Record<RewardType, number>;
}
