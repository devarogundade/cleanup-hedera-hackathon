import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalDonations: number;
  totalAmount: number;
  nftsCollected: number;
  xp: number;
  level: number;
  avatarUrl?: string;
}

export const useLeaderboard = (limit: number = 100) => {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("account_id, username, avatar_url, total_xp, level, total_donations, total_fractions, total_nfts, total_donation_value")
        .order("total_xp", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform data and add ranks
      return data.map((profile, index) => ({
        rank: index + 1,
        userId: profile.account_id,
        username: profile.username || "Anonymous",
        totalDonations: profile.total_donations,
        totalAmount: Number(profile.total_donation_value || 0),
        nftsCollected: profile.total_nfts,
        xp: profile.total_xp,
        level: profile.level,
        avatarUrl: profile.avatar_url || undefined,
      })) as LeaderboardEntry[];
    },
  });
};

export const useLeaderboardStats = () => {
  return useQuery({
    queryKey: ["leaderboard-stats"],
    queryFn: async () => {
      // Get aggregate stats from profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("total_donations, total_nfts, total_donation_value")
        .gt("total_donations", 0);

      if (error) throw error;

      const totalDonations = data.reduce((sum, p) => sum + p.total_donations, 0);
      const totalNFTs = data.reduce((sum, p) => sum + p.total_nfts, 0);
      const activeWarriors = data.length;

      // Get total HBAR from profiles
      const totalHBAR = data.reduce((sum, p) => sum + Number(p.total_donation_value || 0), 0);

      return {
        totalDonations,
        totalHBAR: totalHBAR.toFixed(2),
        totalNFTs,
        activeWarriors,
      };
    },
  });
};
