import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Transaction {
  id: string;
  userId: string;
  roundId: number;
  amount: number;
  currency: string;
  fractionCount: number;
  xpEarned: number;
  transactionId: string;
  createdAt: string;
  status: string;
  type?: string;
  message?: string;
}

export const useTransactions = (userId?: string, limit: number = 10) => {
  return useQuery({
    queryKey: ["transactions", userId, limit],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((transaction) => ({
        id: transaction.id,
        userId: transaction.user_id,
        roundId: transaction.round_id,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        fractionCount: transaction.fraction_ids?.length || 0,
        xpEarned: transaction.xp_earned,
        transactionId: transaction.transaction_id,
        createdAt: transaction.created_at,
        status: transaction.status,
        type: transaction.type || "donation",
        message: transaction.message || null,
      })) as Transaction[];
    },
    enabled: !!userId,
  });
};

export const useRecentTransactions = (limit: number = 10) => {
  return useQuery({
    queryKey: ["recent-transactions", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          profiles!transactions_user_id_fkey (username, avatar_url)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((transaction: any) => ({
        id: transaction.id,
        userId: transaction.user_id,
        username: transaction.profiles?.username || "Anonymous",
        avatarUrl: transaction.profiles?.avatar_url || null,
        roundId: transaction.round_id,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        fractionCount: transaction.fraction_ids?.length || 0,
        xpEarned: transaction.xp_earned,
        transactionId: transaction.transaction_id,
        createdAt: transaction.created_at,
        status: transaction.status,
        type: transaction.type || "donation",
        message: transaction.message || null,
      }));
    },
  });
};
