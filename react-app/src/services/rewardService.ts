/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Reward Service
 * Handles reward unlocking and milestone checking logic
 */

import { supabase } from "@/integrations/supabase/client";

export interface Reward {
  id: number;
  type: string;
  title: string;
  description: string;
  value: string;
  icon: string | null;
  rarity: string | null;
  requirement_level: number | null;
  requirement_xp: number | null;
  created_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: number;
  progress_current: number;
  progress_total: number;
  status: "locked" | "available" | "claimed";
  earned_date: string | null;
  claimed_date: string | null;
  created_at: string;
}

/**
 * Reward milestones - 40+ milestones for various achievements
 */
export const REWARD_MILESTONES = [
  // NFT Rewards (10 milestones)
  { level: 1, xp: 0, type: "nft", value: "Beginner Badge NFT" },
  { level: 3, xp: 200, type: "nft", value: "Bronze Eco Warrior NFT" },
  { level: 5, xp: 400, type: "nft", value: "Silver Champion NFT" },
  { level: 7, xp: 600, type: "nft", value: "Gold Guardian NFT" },
  { level: 10, xp: 900, type: "nft", value: "Platinum Hero NFT" },
  { level: 15, xp: 1400, type: "nft", value: "Diamond Legend NFT" },
  { level: 20, xp: 1900, type: "nft", value: "Master Eco Warrior NFT" },
  { level: 25, xp: 2400, type: "nft", value: "Legendary Protector NFT" },
  { level: 30, xp: 2900, type: "nft", value: "Elite Champion NFT" },
  { level: 40, xp: 3900, type: "nft", value: "Ultimate Planet Saver NFT" },

  // HBAR Rewards (15 milestones)
  { level: 2, xp: 100, type: "hbar", value: "1 HBAR" },
  { level: 4, xp: 300, type: "hbar", value: "2 HBAR" },
  { level: 6, xp: 500, type: "hbar", value: "3 HBAR" },
  { level: 8, xp: 700, type: "hbar", value: "5 HBAR" },
  { level: 9, xp: 800, type: "hbar", value: "7 HBAR" },
  { level: 11, xp: 1000, type: "hbar", value: "10 HBAR" },
  { level: 12, xp: 1100, type: "hbar", value: "12 HBAR" },
  { level: 13, xp: 1200, type: "hbar", value: "15 HBAR" },
  { level: 14, xp: 1300, type: "hbar", value: "18 HBAR" },
  { level: 16, xp: 1500, type: "hbar", value: "20 HBAR" },
  { level: 18, xp: 1700, type: "hbar", value: "25 HBAR" },
  { level: 22, xp: 2100, type: "hbar", value: "30 HBAR" },
  { level: 26, xp: 2500, type: "hbar", value: "40 HBAR" },
  { level: 35, xp: 3400, type: "hbar", value: "50 HBAR" },
  { level: 50, xp: 4900, type: "hbar", value: "100 HBAR" },

  // Physical Rewards (15 milestones)
  { level: 5, xp: 400, type: "physical", value: "Eco Warrior Sticker Pack" },
  { level: 8, xp: 700, type: "physical", value: "Reusable Water Bottle" },
  { level: 10, xp: 900, type: "physical", value: "Eco-Friendly Tote Bag" },
  { level: 12, xp: 1100, type: "physical", value: "Bamboo Utensil Set" },
  { level: 15, xp: 1400, type: "physical", value: "Solar-Powered Charger" },
  { level: 17, xp: 1600, type: "physical", value: "Recycled Notebook Set" },
  { level: 20, xp: 1900, type: "physical", value: "Bronze Eco Trophy" },
  { level: 23, xp: 2200, type: "physical", value: "Organic Cotton T-Shirt" },
  { level: 25, xp: 2400, type: "physical", value: "Silver Eco Trophy" },
  { level: 28, xp: 2700, type: "physical", value: "Eco Warrior Cap" },
  { level: 30, xp: 2900, type: "physical", value: "Gold Eco Trophy" },
  { level: 33, xp: 3200, type: "physical", value: "Premium Eco Backpack" },
  { level: 37, xp: 3600, type: "physical", value: "Sustainable Hoodie" },
  { level: 40, xp: 3900, type: "physical", value: "Platinum Eco Trophy" },
  { level: 50, xp: 4900, type: "physical", value: "Legendary Eco Award" },
];

export class RewardService {
  /**
   * Check and unlock rewards based on user progress
   */
  static async checkRewards(
    userId: string,
    profileData: {
      total_xp: number;
      level: number;
    }
  ): Promise<Reward[]> {
    const newlyUnlockedRewards: Reward[] = [];

    try {
      // Get all rewards from database
      const { data: allRewards } = await supabase
        .from("rewards")
        .select("*")
        .order("requirement_level", { ascending: true });

      if (!allRewards) return [];

      // Get user's current rewards
      const { data: userRewards } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", userId);

      const userRewardMap = new Map(
        userRewards?.map((ur) => [ur.reward_id, ur]) || []
      );

      // Check each reward
      for (const reward of allRewards) {
        const userReward = userRewardMap.get(reward.id);

        // Check if reward should be unlocked
        const meetsLevelRequirement =
          !reward.requirement_level ||
          profileData.level >= reward.requirement_level;
        const meetsXPRequirement =
          !reward.requirement_xp ||
          profileData.total_xp >= reward.requirement_xp;

        const shouldUnlock = meetsLevelRequirement && meetsXPRequirement;

        // Skip if already earned or claimed
        if (
          userReward?.status === "available" ||
          userReward?.status === "claimed"
        ) {
          continue;
        }

        if (shouldUnlock) {
          if (userReward) {
            // Update existing reward
            const { error } = await supabase
              .from("user_rewards")
              .update({
                status: "available",
                earned_date: new Date().toISOString(),
                progress_current:
                  reward.requirement_xp || reward.requirement_level || 0,
              })
              .eq("id", userReward.id);

            if (!error) {
              newlyUnlockedRewards.push(reward);

              // Update profile total_rewards count
              const { data: currentProfile } = await supabase
                .from("profiles")
                .select("total_rewards")
                .eq("account_id", userId)
                .maybeSingle();

              if (currentProfile) {
                await supabase
                  .from("profiles")
                  .update({ total_rewards: currentProfile.total_rewards + 1 })
                  .eq("account_id", userId);
              }
            }
          } else {
            // Create new reward entry
            const { error } = await supabase.from("user_rewards").insert({
              user_id: userId,
              reward_id: reward.id,
              status: "available",
              earned_date: new Date().toISOString(),
              progress_current:
                reward.requirement_xp || reward.requirement_level || 0,
              progress_total:
                reward.requirement_xp || reward.requirement_level || 0,
            });

            if (!error) {
              newlyUnlockedRewards.push(reward);
            }
          }
        } else {
          // Create locked reward entry if doesn't exist
          if (!userReward) {
            await supabase.from("user_rewards").insert({
              user_id: userId,
              reward_id: reward.id,
              status: "locked",
              progress_current: profileData.level,
              progress_total:
                reward.requirement_xp || reward.requirement_level || 0,
            });
          }
        }
      }

      return newlyUnlockedRewards;
    } catch (error) {
      console.error("Error checking rewards:", error);
      return [];
    }
  }

  /**
   * Claim a reward
   */
  static async claimReward(
    userId: string,
    rewardId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if reward is available
      const { data: userReward } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", userId)
        .eq("reward_id", rewardId)
        .single();

      if (!userReward) {
        return { success: false, error: "Reward not found" };
      }

      if (userReward.status !== "available") {
        return { success: false, error: "Reward not available" };
      }

      // Update reward as claimed
      const { error } = await supabase
        .from("user_rewards")
        .update({
          status: "claimed",
          claimed_date: new Date().toISOString(),
        })
        .eq("id", userReward.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update profile stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_claimed_rewards, total_rewards, total_rewards_value")
        .eq("account_id", userId)
        .maybeSingle();

      if (profile) {
        // Get the reward value
        const { data: rewardData } = await supabase
          .from("rewards")
          .select("value, type")
          .eq("id", rewardId)
          .single();

        let rewardValue = 0;
        if (
          rewardData?.type === "reward" &&
          rewardData.value.includes("HBAR")
        ) {
          rewardValue = parseFloat(rewardData.value.split(" ")[0]) || 0;
        }

        await supabase
          .from("profiles")
          .update({
            total_claimed_rewards: profile.total_claimed_rewards + 1,
            total_rewards_value: profile.total_rewards_value + rewardValue,
          })
          .eq("account_id", userId);
      }

      return { success: true };
    } catch (error) {
      console.error("Error claiming reward:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get reward statistics
   */
  static async getRewardStats(userId: string): Promise<{
    available: number;
    claimed: number;
    locked: number;
    totalValue: number;
  }> {
    // Get user rewards
    const { data: userRewards } = await supabase
      .from("user_rewards")
      .select("status")
      .eq("user_id", userId);

    const available =
      userRewards?.filter((r) => r.status === "available").length || 0;
    const claimed =
      userRewards?.filter((r) => r.status === "claimed").length || 0;
    const locked =
      userRewards?.filter((r) => r.status === "locked").length || 0;

    // Get total value from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_rewards_value")
      .eq("account_id", userId)
      .maybeSingle();

    const totalValue = Number(profile?.total_rewards_value || 0);

    return { available, claimed, locked, totalValue };
  }
}
