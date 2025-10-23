import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoundMetadata } from "@/types/round";

export const useRounds = () => {
  return useQuery({
    queryKey: ["rounds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      return data.map((round) => ({
        id: round.id,
        type: round.type,
        startDate: round.start_date,
        endDate: round.end_date,
        creationTime: round.created_at,
        endedTime:
          new Date(round.end_date) < new Date() ? round.end_date : undefined,
        isActive:
          new Date(round.start_date) <= new Date() &&
          new Date(round.end_date) >= new Date(),
        contractAddress: round.contract_address,
        totalDonations: Number(round.total_donations) || 0,
        totalWithdrawals: Number(round.total_withdrawals) || 0,
        location: {
          name: round.location_name,
          coordinates: round.location_coordinates,
          description: round.location_description || "",
        },
        imageUrl: round.image_url,
        unitValue: round.unit_value,
        totalFractions: round.total_fractions,
        stats: {
          totalDonations: round.total_amount,
          donatedAmount: round.total_amount,
          totalAmount: round.total_amount,
          totalVotes: round.total_votes,
          totalFractions: round.total_fractions,
          nftsMinted: round.donated_fractions,
          participantCount: round.participant_count,
        },
        winningNGO: undefined,
      })) as RoundMetadata[];
    },
  });
};

export const useLastestRound = () => {
  return useQuery({
    queryKey: ["latest-rounds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .order("id", { ascending: false })
        .limit(1);

      if (error) throw error;
      if (data.length === 0) throw new Error("Round not found!.");

      const round = data[0];

      return {
        id: round.id,
        type: round.type,
        startDate: round.start_date,
        endDate: round.end_date,
        creationTime: round.created_at,
        endedTime:
          new Date(round.end_date) < new Date() ? round.end_date : undefined,
        isActive:
          new Date(round.start_date) <= new Date() &&
          new Date(round.end_date) >= new Date(),
        contractAddress: round.contract_address,
        totalDonations: Number(round.total_donations) || 0,
        totalWithdrawals: Number(round.total_withdrawals) || 0,
        location: {
          name: round.location_name,
          coordinates: round.location_coordinates,
          description: round.location_description || "",
        },
        imageUrl: round.image_url,
        unitValue: round.unit_value,
        totalFractions: round.total_fractions,
        stats: {
          totalDonations: round.total_amount,
          donatedAmount: round.total_amount,
          totalAmount: round.total_amount,
          totalVotes: round.total_votes,
          totalFractions: round.total_fractions,
          nftsMinted: round.donated_fractions,
          participantCount: round.participant_count,
        },
        winningNGO: undefined,
      } as RoundMetadata;
    },
  });
};

export const useRound = (roundId: number) => {
  return useQuery({
    queryKey: ["round", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .eq("id", roundId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        type: data.type,
        startDate: data.start_date,
        endDate: data.end_date,
        creationTime: data.created_at,
        endedTime:
          new Date(data.end_date) < new Date() ? data.end_date : undefined,
        isActive:
          new Date(data.start_date) <= new Date() &&
          new Date(data.end_date) >= new Date(),
        contractAddress: data.contract_address,
        totalDonations: Number(data.total_donations) || 0,
        totalWithdrawals: Number(data.total_withdrawals) || 0,
        location: {
          name: data.location_name,
          coordinates: data.location_coordinates,
          description: data.location_description || "",
        },
        imageUrl: data.image_url,
        unitValue: data.unit_value,
        totalFractions: data.total_fractions,
        stats: {
          totalDonations: data.total_amount,
          donatedAmount: data.total_amount,
          totalAmount: data.total_amount,
          totalVotes: data.total_votes,
          totalFractions: data.total_fractions,
          nftsMinted: data.donated_fractions,
          participantCount: data.participant_count,
        },
        winningNGO: undefined,
      } as RoundMetadata;
    },
  });
};
