import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Fraction } from "@/types/fraction";

// Hook to get recorded fractions for a round
export const useRecordedFractions = (roundId: number) => {
  return useQuery({
    queryKey: ["recorded-fractions", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fractions")
        .select("*")
        .eq("round_id", roundId)
        .order("id", { ascending: true });

      if (error) throw error;

      return data.map(
        (fraction) =>
          ({
            id: fraction.id,
            position: fraction.position,
            tokenId: fraction.token_id || undefined,
            donor: fraction.donor_id || undefined,
            roundId: fraction.round_id,
            donated: true,
            notAllowed: fraction.not_allowed,
          } as Partial<Fraction>)
      );
    },
  });
};

// Hook to generate full grid with donated fractions marked
export const useFractions = (
  roundId: number,
  totalFractions: number,
  unitValue: number
) => {
  const { data: recordedFractions, isLoading } = useRecordedFractions(roundId);

  const gridConfig = {
    rows: Math.sqrt(totalFractions),
    cols: Math.sqrt(totalFractions),
  };

  return useQuery({
    queryKey: ["fractions-grid", roundId, gridConfig.rows, gridConfig.cols],
    queryFn: async () => {
      const { rows, cols } = gridConfig;
      const fractionWidth = 100 / cols;
      const fractionHeight = 100 / rows;
      const fractionArray: Omit<Fraction, "id">[] = [];

      // Create full grid - IDs start from 1 to match token IDs
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const position = row * cols + col + 1; // Start from 1 instead of 0

          const recordedFraction = recordedFractions?.find(
            (f) => f.tokenId && f.position === position
          );

          fractionArray.push({
            position,
            x: col * fractionWidth,
            y: row * fractionHeight,
            width: fractionWidth,
            height: fractionHeight,
            donated: recordedFraction?.donated,
            notAllowed: recordedFraction?.notAllowed,
            price: unitValue,
            tokenId: recordedFraction?.tokenId,
            donor: recordedFraction?.donor,
            roundId,
          });
        }
      }

      return fractionArray;
    },
    enabled: !isLoading,
  });
};

export const useUpdateFractions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fractionIds,
      donorId,
      roundId,
      transactionId,
    }: {
      fractionIds: number[];
      donorId: string;
      roundId: number;
      transactionId: string;
    }) => {
      // Insert donated fractions
      const fractionsToInsert = fractionIds.map((id) => ({
        token_id: id,
        round_id: roundId,
        donated: true,
        donor_id: donorId,
        transaction_id: transactionId,
      }));

      const { data, error } = await supabase
        .from("fractions")
        .insert(fractionsToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["fractions-grid", variables.roundId],
      });
      queryClient.invalidateQueries({
        queryKey: ["donated-fractions", variables.roundId],
      });
    },
  });
};
