/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Achievement Service
 * Handles all achievement checking and unlocking logic
 */

import { supabase } from "@/integrations/supabase/client";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  rarity: string;
  requirement_type: string;
  requirement_value: number;
  created_at?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_current: number;
  progress_total: number;
  unlocked_at: string | null;
  created_at: string;
}

/**
 * Achievement definitions - these match the database entries
 */
export const ACHIEVEMENT_TYPES = {
  FIRST_DONATION: "first_donation",
  FIVE_DONATIONS_SINGLE_ROUND: "five_donations_single_round",
  TEN_DONATIONS: "ten_donations",
  FIRST_NFT: "first_nft",
  TEN_NFTS: "ten_nfts",
  FIFTY_NFTS: "fifty_nfts",
  HUNDRED_NFTS: "hundred_nfts",
  TOTAL_DONATED_10_HBAR: "total_donated_10_hbar",
  TOTAL_DONATED_50_HBAR: "total_donated_50_hbar",
  TOTAL_DONATED_100_HBAR: "total_donated_100_hbar",
  TOTAL_DONATED_500_HBAR: "total_donated_500_hbar",
  LEVEL_5: "level_5",
  LEVEL_10: "level_10",
  LEVEL_25: "level_25",
  LEVEL_50: "level_50",
  THREE_DAY_STREAK: "three_day_streak",
  SEVEN_DAY_STREAK: "seven_day_streak",
  THIRTY_DAY_STREAK: "thirty_day_streak",
  VOTED_FIVE_TIMES: "voted_five_times",
  SUPPORTED_ALL_NGOS: "supported_all_ngos",
} as const;

export class AchievementService {
  /**
   * Check and update user achievements after a donation
   */
  static async checkAchievements(
    userId: string,
    profileData: {
      total_donations: number;
      total_nfts: number;
      total_donation_value: number;
      level: number;
      current_streak: number;
    },
    donationData: {
      roundId: number;
      fractionCount: number;
    }
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    try {
      // Get all achievements
      const { data: allAchievements } = await supabase
        .from("achievements")
        .select("*");

      if (!allAchievements) return [];

      // Get user's current achievement progress
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", userId);

      const userAchievementMap = new Map(
        userAchievements?.map((ua) => [ua.achievement_id, ua]) || []
      );

      // Check each achievement
      for (const achievement of allAchievements) {
        const userAchievement = userAchievementMap.get(achievement.id);

        // Skip if already unlocked
        if (userAchievement?.unlocked_at) continue;

        const currentProgress = this.calculateProgress(
          achievement,
          profileData,
          donationData
        );

        const isUnlocked = currentProgress >= achievement.requirement_value;

        if (userAchievement) {
          // Update existing achievement progress
          const { error } = await supabase
            .from("user_achievements")
            .update({
              progress_current: currentProgress,
              unlocked_at: isUnlocked ? new Date().toISOString() : null,
            })
            .eq("id", userAchievement.id);

          if (!error && isUnlocked) {
            unlockedAchievements.push(achievement);
          }
        } else {
          // Create new achievement entry
          const { error } = await supabase.from("user_achievements").insert({
            user_id: userId,
            achievement_id: achievement.id,
            progress_current: currentProgress,
            progress_total: achievement.requirement_value,
            unlocked_at: isUnlocked ? new Date().toISOString() : null,
          });

          if (!error && isUnlocked) {
            unlockedAchievements.push(achievement);
          }
        }
      }

      // Award XP for unlocked achievements
      if (unlockedAchievements.length > 0) {
        const totalXP = unlockedAchievements.reduce(
          (sum, ach) => sum + ach.xp,
          0
        );
        await this.awardAchievementXP(userId, totalXP);
      }

      return unlockedAchievements;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  }

  /**
   * Calculate progress for a specific achievement
   */
  private static calculateProgress(
    achievement: Achievement,
    profileData: {
      total_donations: number;
      total_nfts: number;
      total_donation_value: number;
      level: number;
      current_streak: number;
    },
    donationData: {
      roundId: number;
      fractionCount: number;
    }
  ): number {
    switch (achievement.requirement_type) {
      case "total_donations":
        return profileData.total_donations;

      case "total_nfts":
        return profileData.total_nfts;

      case "total_donated_hbar":
        return Math.floor(profileData.total_donation_value);

      case "level":
        return profileData.level;

      case "streak_days":
        return profileData.current_streak;

      case "donations_single_round":
        // This would need additional query to count donations in specific round
        return 0; // Placeholder - implement if needed

      case "voted_ngos":
        // Would need to count unique NGOs voted for
        return 0; // Placeholder - implement if needed

      default:
        return 0;
    }
  }

  /**
   * Award XP for unlocked achievements
   */
  private static async awardAchievementXP(
    userId: string,
    xp: number
  ): Promise<void> {
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_xp, level")
      .eq("account_id", userId)
      .single();

    if (profile) {
      const newTotalXP = profile.total_xp + xp;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXP,
          level: newLevel,
        })
        .eq("account_id", userId);
    }
  }

  /**
   * Get user's achievement statistics
   */
  static async getAchievementStats(userId: string): Promise<{
    total: number;
    unlocked: number;
    locked: number;
    totalXP: number;
  }> {
    const { data: achievements } = await supabase
      .from("achievements")
      .select("*");

    const { data: userAchievements } = await supabase
      .from("user_achievements")
      .select("*, achievements(xp)")
      .eq("user_id", userId);

    const total = achievements?.length || 0;
    const unlocked =
      userAchievements?.filter((ua) => ua.unlocked_at).length || 0;
    const locked = total - unlocked;
    const totalXP =
      userAchievements
        ?.filter((ua) => ua.unlocked_at)
        .reduce((sum, ua: any) => sum + (ua.achievements?.xp || 0), 0) || 0;

    return { total, unlocked, locked, totalXP };
  }
}
