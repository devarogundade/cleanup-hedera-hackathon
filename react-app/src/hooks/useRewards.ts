import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RewardService } from "@/services/rewardService";
import { toast } from "@/hooks/use-toast";
import type { Reward } from "@/types/reward";

export const useRewards = () => {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useUserRewards = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ["user-rewards", accountId],
    queryFn: async () => {
      if (!accountId) return [];

      // Use accountId directly since it's now the primary key
      const { data, error } = await supabase
        .from("user_rewards")
        .select(`
          *,
          rewards (*)
        `)
        .eq("user_id", accountId);

      if (error) throw error;

      return data.map((ur) => ({
        id: ur.reward_id,
        title: ur.rewards?.title || "",
        description: ur.rewards?.description || "",
        type: ur.rewards?.type || "reward",
        claimed: ur.status === "claimed",
        status: ur.status,
        value: ur.rewards?.value || "",
        progress: `${ur.progress_current}/${ur.progress_total}`,
        progressCurrent: ur.progress_current,
        progressTotal: ur.progress_total,
        earnedDate: ur.earned_date,
        claimedDate: ur.claimed_date,
        icon: ur.rewards?.icon || undefined,
        rarity: ur.rewards?.rarity || undefined,
        deliveryType: ur.rewards?.delivery_type || "digital",
      })) as Reward[];
    },
    enabled: !!accountId,
  });
};

/**
 * Hook to check and unlock rewards based on progress
 */
export const useCheckRewards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      profileData,
    }: {
      userId: string;
      profileData: {
        total_xp: number;
        level: number;
      };
    }) => {
      const unlockedRewards = await RewardService.checkRewards(
        userId,
        profileData
      );

      return unlockedRewards;
    },
    onSuccess: (unlockedRewards) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-stats"] });

      // Show toast for each unlocked reward
      unlockedRewards.forEach((reward) => {
        toast({
          title: "🎁 Reward Unlocked!",
          description: `${reward.title} - ${reward.value}`,
        });
      });
    },
    onError: (error: Error) => {
      console.error("Error checking rewards:", error);
    },
  });
};

export const useClaimReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      rewardId,
    }: {
      accountId: string;
      rewardId: number;
    }) => {
      // Use accountId directly since it's now the primary key
      const result = await RewardService.claimReward(accountId, rewardId);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to claim reward");
      }

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-rewards", variables.accountId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast({
        title: "Reward Claimed!",
        description: "Your reward has been successfully claimed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to claim reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to get reward statistics
 */
export const useRewardStats = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ["rewards-stats", accountId],
    queryFn: async () => {
      if (!accountId) return null;

      // Use accountId directly since it's now the primary key
      return await RewardService.getRewardStats(accountId);
    },
    enabled: !!accountId,
  });
};
