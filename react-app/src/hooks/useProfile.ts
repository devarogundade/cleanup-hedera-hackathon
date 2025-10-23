import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  account_id: string;
  username: string | null;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  total_donations: number;
  total_fractions: number;
  total_nfts: number;
  current_streak: number;
  total_donation_value: number;
  total_rewards: number;
  total_claimed_rewards: number;
  total_rewards_value: number;
  created_at: string;
  updated_at: string;
}

export const useProfile = (accountId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", accountId],
    queryFn: async () => {
      if (!accountId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!accountId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accountId, updates }: { accountId: string; updates: Partial<Profile> }) => {
      // Check if profile exists
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      let result;
      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("account_id", accountId)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            account_id: accountId,
            ...updates
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profile", data.account_id] });
    },
  });
};
