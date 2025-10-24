/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AchievementService } from "@/services/achievementService";
import { RewardService } from "@/services/rewardService";
import { executeTransaction } from "@/services/hashconnect";
import {
  AccountId,
  AccountInfoQuery,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  EvmAddress,
  Hbar,
  TokenAssociateTransaction,
  TokenId,
  TransactionReceipt,
} from "@hashgraph/sdk";
import { MintableFraction, RoundMetadata } from "@/types";
import { ethers } from "ethers";
import { APP_CONFIG } from "@/data/constants";
import { PaystackService } from "@/services/paystackService";
import { testnetClient } from "@/services/hederaclient";
import TokenAssociation from "node_modules/@hashgraph/sdk/lib/token/TokenAssociation";

interface DonationParams {
  accountId: string;
  roundMetadata: RoundMetadata;
  fractions: MintableFraction[];
  ngoId: string;
  amount: number;
  currency: "HBAR" | "NGN" | "XP";
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

      onProgress("Verifying profile...");

      // Get user profile to get the UUID and current stats
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      if (profileError || !profile) {
        throw new Error("Profile not found. Please set up your profile first.");
      }

      // Handle NGN payment with Paystack
      if (currency === APP_CONFIG.NGN_CURRENCY) {
        onProgress("Processing payment with Paystack...");

        // Calculate amount in NGN
        const amountInNGN = amount * APP_CONFIG.NGN_TO_HBAR_RATE;

        // Get user email (use a default or prompt if not available)
        const userEmail = profile.username
          ? `${profile.username.toLowerCase().replace(/\s+/g, "")}@cleanup.app`
          : `${accountId}@cleanup.app`;

        // Wait for Paystack payment
        await new Promise<void>((resolve, reject) => {
          try {
            PaystackService.initializePayment({
              email: userEmail,
              amount: amountInNGN,
              currency: APP_CONFIG.NGN_CURRENCY,
              metadata: {
                account_id: accountId,
                round_id: roundMetadata.id,
                fraction_count: fractions.length,
                ngo_id: ngoId,
              },
              onSuccess: (transaction) => {
                console.log("Paystack payment successful:", transaction);
                toast({
                  title: "Payment Successful",
                  description: `NGN ${amountInNGN.toFixed(
                    2
                  )} payment confirmed`,
                });
                resolve();
              },
              onClose: () => {
                reject(new Error("Payment cancelled by user"));
              },
            });
          } catch (error) {
            reject(error);
          }
        });
      }

      // If paying with XP, check balance and deduct
      if (currency === APP_CONFIG.XP_CURRENCY) {
        const xpCost = amount;
        if (profile.total_xp < xpCost) {
          throw new Error(
            `Insufficient XP. You need ${xpCost} XP but only have ${profile.total_xp} XP`
          );
        }

        // Deduct XP from user profile
        const { error: xpDeductError } = await supabase
          .from("profiles")
          .update({ total_xp: profile.total_xp - xpCost })
          .eq("account_id", accountId);

        if (xpDeductError)
          throw new Error("Failed to deduct XP from your balance");
      }

      const client = testnetClient();

      const tokenIdCallQuery = new ContractCallQuery()
        .setContractId(ContractId.fromString(roundMetadata.contractId))
        .setFunction("underlying")
        .setGas(100_000);

      const result = await tokenIdCallQuery.execute(client);
      const tokenAddress = result.getAddress(0);

      const accountInfoQuery = new AccountInfoQuery().setAccountId(
        AccountId.fromString(accountId)
      );

      const accountInfo = await accountInfoQuery.execute(client);

      const tokenRelationship = accountInfo.tokenRelationships.get(
        TokenId.fromEvmAddress(0, 0, tokenAddress.replace("0x", ""))
      );

      if (!tokenRelationship) {
        onProgress("Associating to NFT...");

        const associateTx = new TokenAssociateTransaction()
          .setAccountId(AccountId.fromString(accountId))
          .setTokenIds([
            TokenId.fromEvmAddress(0, 0, tokenAddress.replace("0x", "")),
          ]);

        await executeTransaction(accountId, associateTx);
      }

      onProgress("Creating NFT metadata...");

      // Helper to convert Uint8Array to base64
      const toBase64 = (u8: Uint8Array) => {
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < u8.length; i += chunk) {
          binary += String.fromCharCode(...u8.subarray(i, i + chunk));
        }
        return btoa(binary);
      };

      const metadata: Uint8Array[] = [];
      for (const fraction of fractions) {
        // Prepare image base64
        const imageU8 = new Uint8Array(fraction.buffer.buffer as ArrayBuffer);
        const imageBase64 = toBase64(imageU8);
        const imagePath = `round-${roundMetadata.id}/fraction-${fraction.position}.jpg`;

        // Upload image via Edge Function (service role)
        const { data: imageUpload, error: imageInvokeError } =
          await supabase.functions.invoke("upload-to-storage", {
            body: {
              bucket: "cleanup",
              path: imagePath,
              base64: imageBase64,
              contentType: "image/jpeg",
            },
          });
        if (imageInvokeError || !(imageUpload as any)?.publicUrl) {
          throw new Error(
            `Failed to upload image: ${
              imageInvokeError?.message || "no URL returned"
            }`
          );
        }
        const publicUrl = (imageUpload as any).publicUrl as string;

        // Create NFT metadata
        const nftMetadata = {
          name: `${roundMetadata.location.name} - Fraction #${fraction.position}`,
          creator: roundMetadata.contractId,
          description: `Cleanup fraction at ${roundMetadata.location.name}`,
          image: publicUrl,
          type: "image/jpg",
          format: "HIP412@2.0.0",
          properties: {
            row: fraction.row,
            col: fraction.col,
            position: fraction.position,
            location: roundMetadata.location.name,
            roundId: roundMetadata.id,
          },
        };

        // Upload metadata via Edge Function
        const metadataPath = `round-${roundMetadata.id}/metadata-${fraction.position}.json`;
        const metadataJson = JSON.stringify(nftMetadata);
        const metadataBase64 = btoa(unescape(encodeURIComponent(metadataJson)));

        const { data: metaUpload, error: metaInvokeError } =
          await supabase.functions.invoke("upload-to-storage", {
            body: {
              bucket: "cleanup",
              path: metadataPath,
              base64: metadataBase64,
              contentType: "application/json",
            },
          });
        if (metaInvokeError || !(metaUpload as any)?.publicUrl) {
          throw new Error(
            `Failed to upload metadata: ${
              metaInvokeError?.message || "no URL returned"
            }`
          );
        }
        const metadataUrl = (metaUpload as any).publicUrl as string;

        metadata.push(ethers.toUtf8Bytes(metadataUrl));
      }

      onProgress("Minting NFTs...");

      const ngoAccountReq = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${ngoId}`
      );
      const ngoAccount = await ngoAccountReq.json();

      const userAccountReq = await fetch(
        `https://testnet.mirrornode.hedera.com/api/v1/accounts/${accountId}`
      );
      const userAccount = await userAccountReq.json();

      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(roundMetadata?.contractId))
        .setPayableAmount(new Hbar(amount))
        .setFunction(
          "mint",
          new ContractFunctionParameters()
            .addBytesArray(metadata)
            .addAddress(ngoAccount.evm_address)
            .addAddress(userAccount.evm_address)
        )
        .setGas(5_000_000);

      let txReceipt: { serials: Long[] } | null = null;

      if (currency === APP_CONFIG.HBAR_CURRENCY) {
        txReceipt = await executeTransaction(accountId, tx);
      } else {
        tx.freezeWith(client);
        const txResponse = await tx.execute(client);
        txReceipt = await txResponse.getReceipt(client);
      }

      // Convert to HBAR based on currency
      const amountInHBAR =
        currency === APP_CONFIG.HBAR_CURRENCY
          ? amount
          : currency === APP_CONFIG.XP_CURRENCY
          ? amount / APP_CONFIG.HBAR_TO_XP_RATE
          : amount / APP_CONFIG.NGN_TO_HBAR_RATE;

      const amountInNGN =
        currency === APP_CONFIG.NGN_CURRENCY
          ? amount
          : currency === APP_CONFIG.XP_CURRENCY
          ? (amount / APP_CONFIG.HBAR_TO_XP_RATE) * APP_CONFIG.NGN_TO_HBAR_RATE
          : amount * APP_CONFIG.NGN_TO_HBAR_RATE;

      // Calculate XP (10 XP per fraction)
      const xpEarned = fractions.length * 10;

      console.log({ txReceipt });

      const fractionPositions = fractions.map((f) => f.position);
      const nftTokenIds = txReceipt.serials.map(Number);

      // Create transaction record
      const transactionPayload = {
        user_id: accountId,
        round_id: roundMetadata.id,
        type: "donation" as const,
        amount: amountInHBAR,
        amount_in_hbar: amountInHBAR,
        amount_in_ngn: amountInNGN,
        currency,
        fraction_ids: fractionPositions,
        nft_token_ids: nftTokenIds.map(String),
        ngo_id: ngoId,
        voting_power: votingPower,
        xp_earned: xpEarned,
        transaction_id: tx.transactionId.toString(),
        message: message || `Donated ${fractionPositions.length} fractions`,
        status: "confirmed" as const,
      };

      onProgress("Recording transaction...");

      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert([transactionPayload])
        .select()
        .single();

      if (txError) throw txError;

      onProgress("Verifying fractions...");

      // Check if any positions are already donated
      const { data: existingFractions } = await supabase
        .from("fractions")
        .select("position")
        .eq("round_id", roundMetadata.id)
        .in("position", fractionPositions);

      if (existingFractions && existingFractions.length > 0) {
        const alreadyDonated = existingFractions.map((f) => f.position);
        throw new Error(
          `Positions ${alreadyDonated.join(", ")} are already donated`
        );
      }

      // Insert donated fractions into the fractions table
      const fractionsToInsert = fractionPositions.map((position, index) => ({
        round_id: roundMetadata.id,
        donated: true,
        donor_id: accountId,
        transaction_id: transaction.id,
        token_id: nftTokenIds[index],
        position: position,
        not_allowed: false,
      }));

      onProgress("Saving fractions...");

      const { error: fractionsError } = await supabase
        .from("fractions")
        .insert(fractionsToInsert);

      if (fractionsError) throw fractionsError;

      onProgress("Recording vote...");

      // Record NGO vote
      const { error: voteError } = await supabase.from("ngo_votes").insert({
        user_id: accountId,
        donation_id: transaction.id,
        ngo_id: ngoId,
        round_id: roundMetadata.id,
        voting_power: votingPower,
      });

      if (voteError) throw voteError;

      onProgress("Updating round stats...");

      // Update round stats (simplified - just update the fields directly)
      const { data: currentRound, error: roundFetchError } = await supabase
        .from("rounds")
        .select("*")
        .eq("id", roundMetadata.id)
        .single();

      if (roundFetchError) throw roundFetchError;

      if (currentRound) {
        onProgress("Checking participation...");

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
              currentRound.donated_fractions + fractionPositions.length,
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

      onProgress("Updating profile stats...");

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXP,
          total_donations: profile.total_donations + 1,
          total_fractions: profile.total_fractions + fractionPositions.length,
          total_nfts: profile.total_nfts + fractionPositions.length,
          total_donation_value: profile.total_donation_value + amountInHBAR,
          level: newLevel,
        })
        .eq("account_id", accountId);

      if (profileUpdateError) throw profileUpdateError;

      onProgress("Checking achievements...");

      // Check and unlock achievements
      const unlockedAchievements = await AchievementService.checkAchievements(
        accountId,
        {
          total_donations: profile.total_donations + 1,
          total_nfts: profile.total_nfts + fractionPositions.length,
          total_donation_value: profile.total_donation_value + amountInHBAR,
          level: newLevel,
          current_streak: profile.current_streak,
        },
        {
          roundId: roundMetadata.id,
          fractionCount: fractionPositions.length,
        }
      );

      onProgress("Checking rewards...");

      // Check and unlock rewards
      const unlockedRewards = await RewardService.checkRewards(accountId, {
        total_xp: newTotalXP,
        level: newLevel,
      });

      return {
        transaction,
        transactionId: tx.transactionId.toString(),
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
      console.log(error);

      toast({
        title: "Donation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
