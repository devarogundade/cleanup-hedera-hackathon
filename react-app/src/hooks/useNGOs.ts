import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NGO } from "@/types/ngo";

export const useNGOs = () => {
  return useQuery({
    queryKey: ["ngos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      
      // Add votes field (will be populated from ngo_votes)
      return data.map(ngo => ({ ...ngo, votes: 0 })) as NGO[];
    },
  });
};

export const useNGOVotes = (roundId: number) => {
  return useQuery({
    queryKey: ["ngo-votes", roundId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ngo_votes")
        .select("ngo_id, voting_power")
        .eq("round_id", roundId);

      if (error) throw error;

      // Aggregate votes by NGO
      const votesByNgo = data.reduce((acc, vote) => {
        acc[vote.ngo_id] = (acc[vote.ngo_id] || 0) + vote.voting_power;
        return acc;
      }, {} as Record<string, number>);

      return votesByNgo;
    },
  });
};
