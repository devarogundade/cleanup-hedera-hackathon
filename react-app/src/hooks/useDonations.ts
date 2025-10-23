import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AchievementService } from "@/services/achievementService";
import { RewardService } from "@/services/rewardService";

interface DonationParams {
  accountId: string;
  roundId: number;
  fractionIds: number[];
  ngoId: number;
  amount: number;
  currency: "HBAR" | "NGN";
  votingPower: number;
  message?: string;
}

interface SmartContractSimulation {
  step: string;
  message: string;
  delay: number;
}

const SMART_CONTRACT_STEPS: SmartContractSimulation[] = [
  {
    step: "initializing",
    message: "Initializing smart contract...",
    delay: 800,
  },
  {
    step: "verifying",
    message: "Verifying wallet and fractions...",
    delay: 1200,
  },
  {
    step: "minting",
    message: "Minting NFTs on Hedera...",
    delay: 1500,
  },
  {
    step: "transferring",
    message: "Transferring funds to escrow...",
    delay: 1000,
  },
  {
    step: "voting",
    message: "Recording your NGO vote...",
    delay: 800,
  },
  {
    step: "confirming",
    message: "Confirming transaction on ledger...",
    delay: 1200,
  },
];

const simulateSmartContractCall = async (
  onProgress?: (step: SmartContractSimulation) => void
): Promise<string> => {
  for (const step of SMART_CONTRACT_STEPS) {
    if (onProgress) {
      onProgress(step);
    }
    await new Promise((resolve) => setTimeout(resolve, step.delay));
  }

  // Generate mock transaction hash
  return `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
};

export const useDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      onProgress,
    }: {
      params: DonationParams;
      onProgress?: (step: SmartContractSimulation) => void;
    }) => {
      const {
        accountId,
        roundId,
        fractionIds,
        ngoId,
        amount,
        currency,
        votingPower,
        message,
      } = params;

      // Get user profile to get the UUID and current stats
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Profile not found. Please set up your profile first.");
      }

      // Simulate smart contract interaction
      const transactionHash = await simulateSmartContractCall(onProgress);

      // Convert to HBAR if NGN
      const amountInHBAR = currency === "HBAR" ? amount : amount / 400;
      const amountInNGN = currency === "NGN" ? amount : amount * 400;

      // Calculate XP (10 XP per fraction)
      const xpEarned = fractionIds.length * 10;

      // Generate NFT token IDs as strings
      const nftTokenIds = fractionIds.map((id) => 
        `${roundId}-${id.toString().padStart(6, "0")}`
      );

      // Create transaction record
      const transactionPayload = {
        user_id: accountId,
        round_id: roundId,
        type: "donation" as const,
        amount: amountInHBAR,
        amount_in_hbar: amountInHBAR,
        amount_in_ngn: amountInNGN,
        currency,
        fraction_ids: fractionIds,
        nft_token_ids: nftTokenIds,
        ngo_id: ngoId,
        voting_power: votingPower,
        xp_earned: xpEarned,
        transaction_hash: transactionHash,
        message: message || `Donated ${fractionIds.length} fractions`,
        status: "confirmed" as const,
      };

      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert([transactionPayload])
        .select()
        .single();

      if (txError) throw txError;

      // Check if any fractions are already donated
      const { data: existingFractions } = await supabase
        .from("fractions")
        .select("token_id")
        .eq("round_id", roundId)
        .in("token_id", fractionIds);

      if (existingFractions && existingFractions.length > 0) {
        const alreadyDonated = existingFractions.map(f => f.token_id);
        throw new Error(`Fractions ${alreadyDonated.join(", ")} are already donated`);
      }

      // Insert donated fractions into the fractions table
      const fractionsToInsert = fractionIds.map((fractionId) => ({
        round_id: roundId,
        donated: true,
        donor_id: accountId,
        transaction_id: transaction.id,
        token_id: fractionId,
        not_allowed: false,
      }));

      const { error: fractionsError } = await supabase
        .from("fractions")
        .insert(fractionsToInsert);

      if (fractionsError) throw fractionsError;

      // Record NGO vote
      const { error: voteError } = await supabase
        .from("ngo_votes")
        .insert({
          user_id: accountId,
          donation_id: transaction.id,
          ngo_id: ngoId,
          round_id: roundId,
          voting_power: votingPower,
        });

      if (voteError) throw voteError;

      // Update round stats (simplified - just update the fields directly)
      const { data: currentRound, error: roundFetchError } = await supabase
        .from("rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (roundFetchError) throw roundFetchError;

      if (currentRound) {
        // Check if this is user's first donation in this round
        const { data: userDonations } = await supabase
          .from("transactions")
          .select("id")
          .eq("user_id", accountId)
          .eq("round_id", roundId)
          .eq("type", "donation")
          .limit(2);

        const isFirstDonation = userDonations?.length === 1; // Only the current transaction

        const { error: roundUpdateError } = await supabase
          .from("rounds")
          .update({
            donated_fractions: currentRound.donated_fractions + fractionIds.length,
            total_amount: currentRound.total_amount + amountInHBAR,
            total_donations: currentRound.total_donations + amountInHBAR,
            total_votes: currentRound.total_votes + votingPower,
            participant_count: isFirstDonation 
              ? currentRound.participant_count + 1 
              : currentRound.participant_count,
          })
          .eq("id", roundId);

        if (roundUpdateError) throw roundUpdateError;
      }

      // Update profile stats
      const newTotalXP = profile.total_xp + xpEarned;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXP,
          total_donations: profile.total_donations + 1,
          total_fractions: profile.total_fractions + fractionIds.length,
          total_nfts: profile.total_nfts + fractionIds.length,
          total_donation_value: profile.total_donation_value + amountInHBAR,
          level: newLevel,
        })
        .eq("account_id", accountId);

      if (profileUpdateError) throw profileUpdateError;

      // Check and unlock achievements
      const unlockedAchievements = await AchievementService.checkAchievements(
        accountId,
        {
          total_donations: profile.total_donations + 1,
          total_nfts: profile.total_nfts + fractionIds.length,
          total_donation_value: profile.total_donation_value + amountInHBAR,
          level: newLevel,
          current_streak: profile.current_streak,
        },
        {
          roundId,
          fractionCount: fractionIds.length,
        }
      );

      // Check and unlock rewards
      const unlockedRewards = await RewardService.checkRewards(accountId, {
        total_xp: newTotalXP,
        level: newLevel,
      });

      return {
        transaction,
        transactionHash,
        xpEarned,
        nftTokenIds,
        unlockedAchievements,
        unlockedRewards,
      };
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["fractions"] });
      queryClient.invalidateQueries({ queryKey: ["rounds"] });
      queryClient.invalidateQueries({ queryKey: ["round", variables.params.roundId] });
      queryClient.invalidateQueries({ queryKey: ["ngo-votes"] });
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["user-rewards"] });

      // Show success toast
      toast({
        title: "Donation successful! 🎉",
        description: `Transaction confirmed. You earned ${data.xpEarned} XP!`,
      });

      // Show achievement toasts
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach((achievement) => {
          setTimeout(() => {
            toast({
              title: "🏆 Achievement Unlocked!",
              description: `${achievement.title} - +${achievement.xp} XP`,
            });
          }, 500);
        });
      }

      // Show reward toasts
      if (data.unlockedRewards && data.unlockedRewards.length > 0) {
        data.unlockedRewards.forEach((reward, index) => {
          setTimeout(() => {
            toast({
              title: "🎁 Reward Unlocked!",
              description: `${reward.title} - ${reward.value}`,
            });
          }, 1000 + index * 500);
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Donation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      onProgress,
    }: {
      params: {
        accountId: string;
        roundId: number;
        amount: number;
        currency: "HBAR" | "NGN";
        ngoId: number;
        message?: string;
      };
      onProgress?: (step: SmartContractSimulation) => void;
    }) => {
      const { accountId, roundId, amount, currency, ngoId, message } = params;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_id")
        .eq("account_id", accountId)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Profile not found.");
      }

      // Simulate smart contract interaction
      const withdrawalSteps: SmartContractSimulation[] = [
        {
          step: "initializing",
          message: "Initializing withdrawal...",
          delay: 800,
        },
        {
          step: "verifying",
          message: "Verifying authorization...",
          delay: 1000,
        },
        {
          step: "transferring",
          message: "Transferring funds from escrow...",
          delay: 1500,
        },
        {
          step: "confirming",
          message: "Confirming transaction...",
          delay: 1000,
        },
      ];

      for (const step of withdrawalSteps) {
        if (onProgress) {
          onProgress(step);
        }
        await new Promise((resolve) => setTimeout(resolve, step.delay));
      }

      const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;

      const amountInHBAR = currency === "HBAR" ? amount : amount / 400;
      const amountInNGN = currency === "NGN" ? amount : amount * 400;

      // Create withdrawal transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          user_id: accountId,
          round_id: roundId,
          type: "withdrawal",
          amount: amountInHBAR,
          amount_in_hbar: amountInHBAR,
          amount_in_ngn: amountInNGN,
          currency,
          fraction_ids: [],
          ngo_id: ngoId,
          voting_power: 0,
          xp_earned: 0,
          transaction_hash: transactionHash,
          message: message || `Withdrew ${amount} ${currency}`,
          status: "confirmed",
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update round stats
      const { data: currentRound } = await supabase
        .from("rounds")
        .select("total_withdrawals")
        .eq("id", roundId)
        .single();

      if (currentRound) {
        await supabase
          .from("rounds")
          .update({
            total_withdrawals: currentRound.total_withdrawals + amountInHBAR,
          })
          .eq("id", roundId);
      }

      return {
        transaction,
        transactionHash,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["rounds"] });

      toast({
        title: "Withdrawal successful! ✅",
        description: "Funds transferred successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
