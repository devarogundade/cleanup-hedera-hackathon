import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AchievementService } from "@/services/achievementService";
import { RewardService } from "@/services/rewardService";
import { executeTransaction } from "@/services/hashconnect";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
} from "@hashgraph/sdk";
import { MintableFraction, RoundMetadata } from "@/types";
import { ethers } from "ethers";
import { APP_CONFIG } from "@/data/constants";

interface DonationParams {
  accountId: string;
  roundMetadata: RoundMetadata;
  fractions: MintableFraction[];
  ngoId: string;
  amount: number;
  currency: "HBAR" | "NGN";
  votingPower: number;
  message?: string;
}

export const useDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      params,
      onProgress,
    }: {
      params: DonationParams;
      onProgress?: (step: string) => void;
    }) => {
      const {
        accountId,
        roundMetadata,
        fractions,
        ngoId,
        amount,
        currency,
        votingPower,
        message,
      } = params;

      onProgress("");

      // Get user profile to get the UUID and current stats
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Profile not found. Please set up your profile first.");
      }

      onProgress("");

      const metadata: Uint8Array[] = [];
      for (const fraction of fractions) {
        const imageUrl = ""; // buffer --- upload to supabase
        JSON.stringify({
          name: roundMetadata?.location,
          creator: roundMetadata?.contractId,
          description: roundMetadata?.location,
          image: imageUrl,
          type: "image/jpg",
          format: "HIP412@2.0.0",
          properties: {
            row: fraction.row,
            col: fraction.col,
            location: roundMetadata.location,
          },
        });
        const metadataUrl = ""; // upload json to supabase
        metadata.push(ethers.toUtf8Bytes(metadataUrl));
      }

      onProgress("");

      const tx = new ContractExecuteTransaction()
        .setContractId(roundMetadata?.contractId)
        .setFunction(
          "mint",
          new ContractFunctionParameters()
            .addBytesArray(metadata)
            .addAddress(AccountId.fromString(ngoId).toEvmAddress())
            .addAddress(AccountId.fromString(accountId).toEvmAddress())
        );

      const txResponse = await executeTransaction(accountId, tx);

      // Convert to HBAR if NGN
      const amountInHBAR =
        currency === APP_CONFIG.HBAR_CURRENCY
          ? amount
          : amount / APP_CONFIG.NGN_TO_HBAR_RATE;
      const amountInNGN =
        currency === APP_CONFIG.NGN_CURRENCY
          ? amount
          : amount * APP_CONFIG.NGN_TO_HBAR_RATE;

      // Calculate XP (10 XP per fraction)
      const xpEarned = fractions.length * 10;

      const fractionIds = fractions.map((f) => f.id);
      const nftTokenIds = txResponse.serials.map(Number);

      // Create transaction record
      const transactionPayload = {
        user_id: accountId,
        round_id: roundMetadata.id,
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
        transaction_hash: txResponse.topicId.toString(),
        message: message || `Donated ${fractionIds.length} fractions`,
        status: "confirmed" as const,
      };

      onProgress("");

      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert([transactionPayload])
        .select()
        .single();

      if (txError) throw txError;

      onProgress("");

      // Check if any fractions are already donated
      const { data: existingFractions } = await supabase
        .from("fractions")
        .select("token_id")
        .eq("round_id", roundMetadata.id)
        .in("token_id", fractionIds);

      if (existingFractions && existingFractions.length > 0) {
        const alreadyDonated = existingFractions.map((f) => f.token_id);
        throw new Error(
          `Fractions ${alreadyDonated.join(", ")} are already donated`
        );
      }

      // Insert donated fractions into the fractions table
      const fractionsToInsert = fractionIds.map((fractionId) => ({
        round_id: roundMetadata.id,
        donated: true,
        donor_id: accountId,
        transaction_id: transaction.id,
        token_id: fractionId,
        not_allowed: false,
      }));

      onProgress("");

      const { error: fractionsError } = await supabase
        .from("fractions")
        .insert(fractionsToInsert);

      if (fractionsError) throw fractionsError;

      onProgress("");

      // Record NGO vote
      const { error: voteError } = await supabase.from("ngo_votes").insert({
        user_id: accountId,
        donation_id: transaction.id,
        ngo_id: ngoId,
        round_id: roundMetadata.id,
        voting_power: votingPower,
      });

      if (voteError) throw voteError;

      onProgress("");

      // Update round stats (simplified - just update the fields directly)
      const { data: currentRound, error: roundFetchError } = await supabase
        .from("rounds")
        .select("*")
        .eq("id", roundMetadata.id)
        .single();

      if (roundFetchError) throw roundFetchError;

      if (currentRound) {
        onProgress("");

        // Check if this is user's first donation in this round
        const { data: userDonations } = await supabase
          .from("transactions")
          .select("id")
          .eq("user_id", accountId)
          .eq("round_id", roundMetadata.id)
          .eq("type", "donation")
          .limit(2);

        const isFirstDonation = userDonations?.length === 1; // Only the current transaction

        const { error: roundUpdateError } = await supabase
          .from("rounds")
          .update({
            donated_fractions:
              currentRound.donated_fractions + fractionIds.length,
            total_amount: currentRound.total_amount + amountInHBAR,
            total_donations: currentRound.total_donations + amountInHBAR,
            total_votes: currentRound.total_votes + votingPower,
            participant_count: isFirstDonation
              ? currentRound.participant_count + 1
              : currentRound.participant_count,
          })
          .eq("id", roundMetadata.id);

        if (roundUpdateError) throw roundUpdateError;
      }

      // Update profile stats
      const newTotalXP = profile.total_xp + xpEarned;
      const newLevel = Math.floor(newTotalXP / 100) + 1;

      onProgress("");

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

      onProgress("");

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
          roundId: roundMetadata.id,
          fractionCount: fractionIds.length,
        }
      );

      onProgress("");

      // Check and unlock rewards
      const unlockedRewards = await RewardService.checkRewards(accountId, {
        total_xp: newTotalXP,
        level: newLevel,
      });

      return {
        transaction,
        transactionHash: txResponse.topicId.toString(),
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
      queryClient.invalidateQueries({
        queryKey: ["round", variables.params.roundMetadata.id],
      });
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
