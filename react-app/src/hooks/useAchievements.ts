import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AchievementService } from "@/services/achievementService";
import { toast } from "@/hooks/use-toast";

/**
 * Hook to get all achievements
 */
export const useAchievements = () => {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("xp", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

/**
 * Hook to get user's achievements
 */
export const useUserAchievements = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ["user-achievements", accountId],
    queryFn: async () => {
      if (!accountId) return null;

      // Use accountId directly since it's now the primary key
      const { data, error } = await supabase
        .from("user_achievements")
        .select(
          `
          *,
          achievements (*)
        `
        )
        .eq("user_id", accountId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!accountId,
  });
};

/**
 * Hook to get user's achievement statistics
 */
export const useAchievementStats = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ["achievement-stats", accountId],
    queryFn: async () => {
      if (!accountId) return null;

      // Use accountId directly since it's now the primary key
      return await AchievementService.getAchievementStats(accountId);
    },
    enabled: !!accountId,
  });
};

/**
 * Hook to check and unlock achievements after an action
 */
export const useCheckAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      profileData,
      donationData,
    }: {
      userId: string;
      profileData: {
        total_donations: number;
        total_nfts: number;
        total_donation_value: number;
        level: number;
        current_streak: number;
      };
      donationData: {
        roundId: number;
        fractionCount: number;
      };
    }) => {
      const unlockedAchievements = await AchievementService.checkAchievements(
        userId,
        profileData,
        donationData
      );

      return unlockedAchievements;
    },
    onSuccess: (unlockedAchievements, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["achievement-stats"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Show toast for each unlocked achievement
      unlockedAchievements.forEach((achievement) => {
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.title} - ${achievement.description}`,
        });
      });
    },
    onError: (error: Error) => {
      console.error("Error checking achievements:", error);
    },
  });
};
